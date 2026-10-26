import React from 'react';
import { withTranslation } from 'react-i18next';
import { checkoutAPI, orderAPI } from '../../api';
import { publicShippingAPI } from '../../api/shipping';
import { notify } from '../common/Toast';
import MetaPixel from '../../utils/pixel';
import { pickBestDeliveryOption } from '../../utils/delivery';

var inputClass = 'w-full px-4 py-3 bg-gray-50/70 border border-purple-100 rounded-2xl text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#6C3DF2]/30 focus:border-[#6C3DF2] transition-all';
var selectClass = inputClass + ' bg-white cursor-pointer';
var labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5';
var cardClass = 'product-surface p-5 sm:p-6';

class CheckoutPanel extends React.Component {
  constructor(props) {
    super(props);
    this.shippingRequestId = 0;
    this.couponRequestId = 0;
    this.submitting = false;
    this.mounted = false;
    this.state = {
      wilayas: [],
      communes: [],
      deliveryMethods: [],
      deliveryOptions: [],
      loadingDelivery: false,
      deliveryUnavailable: false,
      submitting: false,
      form: {
        guestName: '',
        guestPhone: '',
        guestWilaya: '',
        guestCity: '',
        guestAddress: '',
        notes: '',
        wilayaId: '',
        communeId: '',
        deliveryCompanyId: '',
        deliveryType: 'home_delivery',
      },
      shippingPrice: 0,
      couponApplied: null,
      couponApplying: false,
      couponError: null,
      couponInput: '',
      manualCouponApplied: null,
      manualCouponApplying: false,
      manualCouponError: null,
    };
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleWilayaChange = this.handleWilayaChange.bind(this);
    this.handleCommuneChange = this.handleCommuneChange.bind(this);
    this.handleDeliveryTypeChange = this.handleDeliveryTypeChange.bind(this);
    this.handleApplyCoupon = this.handleApplyCoupon.bind(this);
    this.handleRemoveCoupon = this.handleRemoveCoupon.bind(this);
    this.submit = this.submit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getItems() {
    if (this.props.items && this.props.items.length > 0) {
      return this.props.items.map(function (item) {
        return {
          ...item,
          productId: parseInt(item.productId || item.id, 10),
          quantity: parseInt(item.quantity, 10) || 1,
        };
      });
    }
    var product = this.props.product;
    if (!product) return [];
    return [{
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images.length > 0 ? product.images[0].url : null),
      quantity: this.props.quantity || 1,
      stock: product.quantity,
      categoryId: product.categoryId,
      categoryName: product.category && product.category.name,
      adminId: product.adminId,
      deliveryCompanyId: product.deliveryCompanyId,
      couponCode: product.coupon && product.coupon.code,
      available: true,
    }];
  }

  itemsSignature(items) {
    return (items || []).map(function (item) {
      return [item.productId, item.quantity, item.price, item.stock].join(':');
    }).join('|');
  }

  componentDidMount() {
    var self = this;
    this.mounted = true;
    if (this.props.onRegisterSubmit) {
      this.props.onRegisterSubmit(this.submit);
    }
    publicShippingAPI.getWilayas().then(function (res) {
      if (!self.mounted) return;
      self.setState({ wilayas: res.data.data.wilayas || [] });
    }).catch(function () {});
    this.syncAssignedCoupon(this.getItems());
  }

  componentDidUpdate(prevProps) {
    var previousItems = this.getItemsFromProps(prevProps);
    var currentItems = this.getItems();
    var itemsChanged = this.itemsSignature(previousItems) !== this.itemsSignature(currentItems);

    if (itemsChanged) {
      if (this.state.form.wilayaId) {
        this.fetchShippingOptions(this.state.form.wilayaId, this.state.form.communeId);
      }
      if (this.state.manualCouponApplied) {
        this.applyCouponCode(this.state.manualCouponApplied.code);
      } else {
        this.syncAssignedCoupon(currentItems);
      }
    }
  }

  getItemsFromProps(props) {
    if (props.items && props.items.length > 0) return props.items;
    if (!props.product) return [];
    return [{
      productId: props.product.id,
      quantity: props.quantity || 1,
      price: props.product.price,
      stock: props.product.quantity,
    }];
  }

  componentWillUnmount() {
    this.mounted = false;
    this.shippingRequestId += 1;
    if (this.props.onRegisterSubmit) {
      this.props.onRegisterSubmit(null);
    }
  }

  handleFieldChange(key, value) {
    var update = {};
    update[key] = value;
    this.setState({ form: Object.assign({}, this.state.form, update) });
  }

  handleWilayaChange(event) {
    var self = this;
    var value = event.target.value;
    var wilaya = this.state.wilayas.find(function (w) { return String(w.id) === String(value); });
    var form = Object.assign({}, this.state.form, {
      wilayaId: value,
      guestWilaya: wilaya ? (wilaya.nameFr || wilaya.name) : '',
      communeId: '',
      guestCity: '',
      deliveryCompanyId: '',
      deliveryType: 'home_delivery',
    });

    this.shippingRequestId += 1;
    this.setState({
      form: form,
      communes: [],
      deliveryMethods: [],
      deliveryOptions: [],
      loadingDelivery: false,
      shippingPrice: 0,
      deliveryUnavailable: false,
    });

    if (!value) return;

    publicShippingAPI.getCommunes(value).then(function (res) {
      if (!self.mounted) return;
      self.setState({ communes: res.data.data.communes || [] });
    }).catch(function () {});

    this.fetchShippingOptions(value, '');
  }

  handleCommuneChange(event) {
    var value = event.target.value;
    var commune = this.state.communes.find(function (c) { return String(c.id) === String(value); });
    var form = Object.assign({}, this.state.form, {
      communeId: value,
      guestCity: commune ? (commune.nameFr || commune.name) : '',
    });
    this.setState({ form: form });
    this.fetchShippingOptions(form.wilayaId, value);
  }

  resetDelivery() {
    this.shippingRequestId += 1;
    this.setState(function (prev) {
      return {
        deliveryMethods: [],
        deliveryOptions: [],
        loadingDelivery: false,
        shippingPrice: 0,
        deliveryUnavailable: false,
        form: Object.assign({}, prev.form, {
          deliveryCompanyId: '',
          deliveryType: 'home_delivery',
        }),
      };
    });
  }

  fetchShippingOptions(wilayaId, communeId) {
    if (!wilayaId) {
      this.resetDelivery();
      return;
    }

    var self = this;
    var requestId = ++this.shippingRequestId;
    var items = this.getItems();
    var params = { wilayaId: wilayaId };
    if (communeId) params.communeId = communeId;
    var productIds = items.map(function (item) { return item.productId; }).filter(Boolean);
    if (productIds.length > 0) params.productIds = productIds.join(',');

    this.setState(function (prev) {
      return {
        deliveryOptions: [],
        deliveryMethods: [],
        loadingDelivery: true,
        shippingPrice: 0,
        deliveryUnavailable: false,
        form: Object.assign({}, prev.form, { deliveryCompanyId: '' }),
      };
    });

    publicShippingAPI.getShippingOptions(params).then(function (res) {
      if (!self.mounted || requestId !== self.shippingRequestId) return;

      var options = res.data.data.options || [];
      var desiredType = self.state.form.deliveryType || 'home_delivery';
      var best = pickBestDeliveryOption(options, desiredType);

      if (!best) {
        self.setState(function (prev) {
          return {
            deliveryOptions: options,
            deliveryMethods: [],
            loadingDelivery: false,
            shippingPrice: 0,
            deliveryUnavailable: true,
            form: Object.assign({}, prev.form, { deliveryCompanyId: '' }),
          };
        });
        return;
      }

      self.setState(function (prev) {
        return {
          deliveryOptions: options,
          deliveryMethods: best.option.methods || [],
          loadingDelivery: false,
          shippingPrice: Number(best.method.price) || 0,
          deliveryUnavailable: false,
          form: Object.assign({}, prev.form, {
            deliveryCompanyId: best.option.deliveryCompanyId,
            deliveryType: best.method.type,
          }),
        };
      });
    }).catch(function () {
      if (!self.mounted || requestId !== self.shippingRequestId) return;
      self.setState(function (prev) {
        return {
          deliveryOptions: [],
          deliveryMethods: [],
          loadingDelivery: false,
          shippingPrice: 0,
          deliveryUnavailable: true,
          form: Object.assign({}, prev.form, { deliveryCompanyId: '' }),
        };
      });
    });
  }

  handleDeliveryTypeChange(type) {
    var best = pickBestDeliveryOption(this.state.deliveryOptions, type);
    if (!best) return;

    this.setState(function (prev) {
      return {
        deliveryMethods: best.option.methods || [],
        shippingPrice: Number(best.method.price) || 0,
        form: Object.assign({}, prev.form, {
          deliveryCompanyId: best.option.deliveryCompanyId,
          deliveryType: best.method.type,
        }),
      };
    });
  }

  syncAssignedCoupon(items) {
    var self = this;
    var t = this.props.t;
    var list = items || this.getItems();
    var assignedCode = list.length === 1 && list[0].couponCode ? list[0].couponCode : null;
    var requestId = ++this.couponRequestId;

    if (!assignedCode || this.state.manualCouponApplied) {
      this.setState({ couponApplied: null, couponApplying: false, couponError: null });
      return;
    }

    this.setState({ couponApplied: null, couponApplying: true, couponError: null });
    orderAPI.validateCoupon({
      code: assignedCode,
      items: list.map(function (item) {
        return { productId: item.productId, quantity: item.quantity };
      }),
    }).then(function (res) {
      if (!self.mounted || requestId !== self.couponRequestId) return;
      var data = res.data.data;
      self.setState({
        couponApplying: false,
        couponApplied: {
          code: data.coupon.code,
          discount: parseFloat(data.discount) || 0,
          freeShipping: !!data.freeShipping,
        },
        couponError: null,
      });
    }).catch(function (err) {
      if (!self.mounted || requestId !== self.couponRequestId) return;
      var message = (err.response && err.response.data && err.response.data.message) || t('checkout.couponInvalid');
      self.setState({ couponApplying: false, couponApplied: null, couponError: message });
    });
  }

  handleApplyCoupon(event) {
    if (event) event.preventDefault();
    this.applyCouponCode(this.state.couponInput);
  }

  applyCouponCode(rawCode) {
    var self = this;
    var t = this.props.t;
    var code = String(rawCode || '').trim().toUpperCase();
    var items = this.getItems();

    if (!code) {
      this.setState({ manualCouponError: t('checkout.couponRequired') });
      return;
    }
    if (items.length === 0) return;

    var requestId = ++this.couponRequestId;
    this.setState({
      manualCouponApplying: true,
      manualCouponError: null,
      couponApplied: null,
      couponError: null,
    });

    orderAPI.validateCoupon({
      code: code,
      items: items.map(function (item) {
        return { productId: item.productId, quantity: item.quantity };
      }),
    }).then(function (res) {
      if (!self.mounted || requestId !== self.couponRequestId) return;
      var data = res.data.data;
      self.setState({
        manualCouponApplying: false,
        manualCouponApplied: {
          code: data.coupon.code,
          discount: parseFloat(data.discount) || 0,
          freeShipping: !!data.freeShipping,
        },
        manualCouponError: null,
        couponInput: data.coupon.code,
        couponApplied: null,
        couponError: null,
      });
    }).catch(function (err) {
      if (!self.mounted || requestId !== self.couponRequestId) return;
      var message = (err.response && err.response.data && err.response.data.message) || t('checkout.couponInvalid');
      self.setState({
        manualCouponApplying: false,
        manualCouponApplied: null,
        manualCouponError: message,
      });
    });
  }

  handleRemoveCoupon() {
    var self = this;
    this.couponRequestId += 1;
    this.setState({
      couponInput: '',
      manualCouponApplied: null,
      manualCouponApplying: false,
      manualCouponError: null,
    }, function () {
      self.syncAssignedCoupon(self.getItems());
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.submit();
  }

  submit() {
    if (this.submitting || this.state.couponApplying || this.state.manualCouponApplying) return;

    var t = this.props.t;
    var self = this;
    var form = this.state.form;
    var items = this.getItems().filter(function (item) {
      var stock = item.stock === null || item.stock === undefined ? null : parseInt(item.stock, 10);
      return item.available !== false
        && parseInt(item.quantity, 10) > 0
        && (stock === null || stock > 0);
    });

    if (items.length === 0) {
      notify(t('cart.emptyTitle'), 'error');
      return;
    }
    if (!form.guestName || !form.guestPhone || !form.wilayaId || !form.communeId || !form.guestAddress) {
      notify(t('checkout.fillRequired'), 'error');
      return;
    }
    if (!form.deliveryCompanyId || !form.deliveryType) {
      notify(t('checkout.deliveryUnavailable'), 'error');
      return;
    }

    this.submitting = true;
    this.setState({ submitting: true });

    var subtotal = items.reduce(function (sum, item) {
      return sum + parseFloat(item.price || 0) * parseInt(item.quantity, 10);
    }, 0);
    var contents = items.map(function (item) {
      return {
        id: String(item.productId),
        quantity: parseInt(item.quantity, 10),
        item_price: parseFloat(item.price || 0),
      };
    });

    MetaPixel.addToCart({
      content_ids: items.map(function (item) { return String(item.productId); }),
      content_type: 'product',
      contents: contents,
      currency: 'DZD',
      value: subtotal,
      num_items: items.reduce(function (sum, item) { return sum + parseInt(item.quantity, 10); }, 0),
    });
    MetaPixel.initiateCheckout({
      content_ids: items.map(function (item) { return String(item.productId); }),
      content_type: 'product',
      contents: contents,
      currency: 'DZD',
      value: subtotal,
      num_items: items.reduce(function (sum, item) { return sum + parseInt(item.quantity, 10); }, 0),
    });

    var payload = {
      items: items.map(function (item) {
        return { productId: item.productId, quantity: parseInt(item.quantity, 10) };
      }),
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestWilaya: form.guestWilaya || '',
      guestCity: form.guestCity || '',
      guestAddress: form.guestAddress,
      notes: form.notes || undefined,
      wilayaId: form.wilayaId,
      communeId: form.communeId,
      deliveryCompanyId: form.deliveryCompanyId,
      deliveryType: form.deliveryType,
    };

    var effectiveCoupon = this.state.manualCouponApplied || this.state.couponApplied;
    if (effectiveCoupon) {
      payload.couponCode = effectiveCoupon.code;
    }

    checkoutAPI.guestCheckout(payload).then(function (res) {
      if (!self.mounted) return;
      var order = res.data.data.order;
      try {
        sessionStorage.setItem('lastOrder', JSON.stringify(order));
      } catch (e) {}

      if (self.props.onOrderPlaced) {
        self.props.onOrderPlaced(order);
        return;
      }
      self.submitting = false;
      self.setState({ submitting: false });
    }).catch(function (err) {
      if (!self.mounted) return;
      var msg = (err.response && err.response.data && err.response.data.message) || t('checkout.error');
      notify(msg, 'error');
      self.submitting = false;
      self.setState({ submitting: false });
    });
  }

  render() {
    var t = this.props.t;
    var form = this.state.form;
    var state = this.state;
    var self = this;
    var items = this.getItems();

    if (items.length === 0) return null;

    var subtotal = items.reduce(function (sum, item) {
      if (item.available === false) return sum;
      return sum + parseFloat(item.price || 0) * parseInt(item.quantity, 10);
    }, 0);
    var productCoupon = this.props.product && this.props.product.coupon;
    var appliedCoupon = state.manualCouponApplied || state.couponApplied;
    var couponDiscount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
    var shipping = appliedCoupon && appliedCoupon.freeShipping ? 0 : (Number(state.shippingPrice) || 0);
    var total = Math.max(0, subtotal + shipping - couponDiscount);
    var allowCoupon = this.props.mode === 'cart';
    var couponApplying = state.couponApplying || state.manualCouponApplying;
    var hasUnavailableItem = items.some(function (item) {
      return item.available === false || (item.stock !== null && item.stock !== undefined && parseInt(item.stock, 10) <= 0);
    });
    var selectedDeliveryCompany = state.deliveryOptions.find(function (option) {
      return String(option.deliveryCompanyId) === String(form.deliveryCompanyId);
    });

    return React.createElement('form', {
      id: 'product-checkout',
      onSubmit: this.handleSubmit,
      className: 'space-y-6 scroll-mt-24',
    },
      // Customer information + delivery method card
      React.createElement('div', { className: cardClass },
        React.createElement('h2', { className: 'text-lg font-bold tracking-tight text-gray-900 mb-5' }, t('storefront.customerInfo.title')),

        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.fullName')),
            React.createElement('input', {
              type: 'text',
              value: form.guestName,
              onChange: function (e) { self.handleFieldChange('guestName', e.target.value); },
              className: inputClass,
              placeholder: t('checkout.fullNamePlaceholder'),
              required: true,
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.phone')),
            React.createElement('input', {
              type: 'tel',
              value: form.guestPhone,
              onChange: function (e) { self.handleFieldChange('guestPhone', e.target.value); },
              className: inputClass,
              placeholder: t('checkout.phonePlaceholder'),
              required: true,
              dir: 'ltr',
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.wilaya')),
            React.createElement('select', {
              value: form.wilayaId,
              onChange: this.handleWilayaChange,
              className: selectClass,
              required: true,
            },
              React.createElement('option', { value: '' }, t('checkout.selectWilaya')),
              state.wilayas.map(function (w) {
                return React.createElement('option', { key: w.id, value: w.id }, w.nameFr + ' - ' + w.nameAr);
              })
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.commune')),
            React.createElement('select', {
              value: form.communeId,
              onChange: this.handleCommuneChange,
              className: selectClass,
              required: true,
              disabled: state.communes.length === 0,
            },
              React.createElement('option', { value: '' }, state.communes.length === 0 ? t('checkout.selectWilayaFirst') : t('checkout.selectCommune')),
              state.communes.map(function (c) {
                return React.createElement('option', { key: c.id, value: c.id }, c.nameFr + ' - ' + c.nameAr);
              })
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.address')),
            React.createElement('textarea', {
              value: form.guestAddress,
              onChange: function (e) { self.handleFieldChange('guestAddress', e.target.value); },
              className: inputClass + ' resize-none',
              placeholder: t('checkout.addressPlaceholder'),
              rows: 3,
              required: true,
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { className: labelClass }, t('checkout.note')),
            React.createElement('textarea', {
              value: form.notes,
              onChange: function (e) { self.handleFieldChange('notes', e.target.value); },
              className: inputClass + ' resize-none',
              placeholder: t('checkout.notePlaceholder'),
              rows: 2,
            })
          )
        ),

        React.createElement('div', { className: 'mt-6 pt-5 border-t border-gray-100' },
          React.createElement('h3', { className: 'text-base font-semibold text-gray-900 mb-4' }, t('checkout.deliveryMethod')),

          selectedDeliveryCompany
            ? React.createElement('p', { className: 'mb-3 text-xs font-medium text-purple-700' },
                t('checkout.selectedDeliveryCompany', { company: selectedDeliveryCompany.deliveryCompanyName }))
            : null,

          !form.wilayaId
            ? React.createElement('p', { className: 'text-sm text-gray-500' }, t('checkout.selectWilayaForDelivery'))
            : state.loadingDelivery
              ? React.createElement('div', { className: 'flex items-center justify-center py-6' },
                  React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-4 border-[#6C3DF2] border-t-transparent' })
                )
              : state.deliveryUnavailable
                ? React.createElement('div', { className: 'bg-red-50 border border-red-200 rounded-xl p-4' },
                    React.createElement('p', { className: 'text-sm text-red-700' }, t('checkout.deliveryUnavailable'))
                  )
                : React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
                    ['home_delivery', 'desk_delivery'].map(function (type) {
                      var method = state.deliveryMethods.find(function (m) { return m.type === type; });
                      var label = type === 'home_delivery' ? t('checkout.homeDelivery') : t('checkout.deskDelivery');
                      var isSelected = !!method && form.deliveryType === type;

                      if (!method) {
                        return React.createElement('div', {
                          key: type,
                          className: 'p-4 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-60',
                        },
                          React.createElement('p', { className: 'font-medium text-gray-500' }, label),
                          React.createElement('p', { className: 'text-sm text-gray-400 mt-1' }, t('checkout.notAvailable'))
                        );
                      }

                      return React.createElement('button', {
                        key: type,
                        type: 'button',
                        onClick: function () { self.handleDeliveryTypeChange(type); },
                        className: 'p-4 rounded-xl border-2 text-left transition-all ' + (
                          isSelected
                            ? 'border-[#6C3DF2] bg-[#6C3DF2]/5 shadow-sm'
                            : 'border-gray-200 hover:border-[#6C3DF2]/40 hover:bg-gray-50'
                        ),
                      },
                        React.createElement('div', { className: 'flex items-center justify-between' },
                          React.createElement('div', { className: 'flex items-center space-x-3' },
                            React.createElement('div', { className: 'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ' + (isSelected ? 'border-[#6C3DF2]' : 'border-gray-300') },
                              isSelected ? React.createElement('div', { className: 'w-3 h-3 rounded-full bg-[#6C3DF2]' }) : null
                            ),
                            React.createElement('div', null,
                              React.createElement('p', { className: 'font-medium text-gray-900' }, label),
                              method.estimatedDaysMin
                                ? React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' },
                                    method.estimatedDaysMin + '-' + method.estimatedDaysMax + ' ' + t('checkout.days'))
                                : null
                            )
                          ),
                          React.createElement('p', { className: 'font-bold text-[#6C3DF2] whitespace-nowrap' }, (Number(method.price) || 0).toFixed(2) + ' DA')
                        )
                      );
                    })
                  )
        )
      ),

      // Order summary card
      React.createElement('div', { className: cardClass },
        React.createElement('h2', { className: 'text-lg font-bold tracking-tight text-gray-900 mb-5' }, t('checkout.orderSummary')),

        React.createElement('div', { className: 'divide-y divide-gray-100' },
          items.map(function (item) {
            var image = item.image || (item.images && item.images.length > 0 ? item.images[0].url : null);
            var lineTotal = parseFloat(item.price || 0) * parseInt(item.quantity, 10);
            return React.createElement('div', { key: item.productId, className: 'flex items-center space-x-4 py-3' },
              image
                ? React.createElement('img', { src: image, alt: item.name, className: 'w-16 h-16 rounded-2xl object-cover ring-1 ring-purple-100 flex-shrink-0' })
                : React.createElement('div', { className: 'w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0' },
                    React.createElement('svg', { className: 'w-8 h-8 text-gray-300', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
                    )
                  ),
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: 'font-medium text-gray-900 line-clamp-2' }, item.name),
                React.createElement('p', { className: 'text-sm text-gray-500' },
                  t('checkout.quantityLabel') + ' ' + item.quantity + ' × ' + parseFloat(item.price || 0).toFixed(2) + ' DA')
              ),
              React.createElement('p', { className: 'font-bold text-gray-900 whitespace-nowrap' }, lineTotal.toFixed(2) + ' DA')
            );
          })
        ),

        // Coupon section. The single-product flow keeps the coupon assigned to
        // the product; the cart flow also lets the customer apply any valid
        // coupon for the combined basket.
        allowCoupon
          ? React.createElement('div', { className: 'pt-4 border-t border-gray-100' },
              React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('checkout.coupon')),
              state.manualCouponApplied
                ? React.createElement('div', { className: 'rounded-xl px-4 py-3 border bg-green-50 border-green-200' },
                    React.createElement('div', { className: 'flex items-start justify-between gap-3' },
                      React.createElement('div', { className: 'min-w-0' },
                        React.createElement('p', { className: 'font-semibold truncate text-green-800' }, state.manualCouponApplied.code),
                        React.createElement('p', { className: 'text-sm mt-0.5 text-green-700' },
                          state.manualCouponApplied.freeShipping
                            ? t('checkout.couponFreeShipping')
                            : t('checkout.couponDiscount', { amount: couponDiscount.toFixed(2) })
                        )
                      ),
                      React.createElement('button', {
                        type: 'button',
                        onClick: this.handleRemoveCoupon,
                        className: 'text-xs font-semibold text-green-800 underline underline-offset-2 hover:text-green-900 flex-shrink-0',
                      }, t('checkout.removeCoupon'))
                    )
                  )
                : React.createElement('div', { className: 'space-y-2' },
                    React.createElement('div', { className: 'flex gap-2' },
                      React.createElement('input', {
                        type: 'text',
                        value: state.couponInput,
                        onChange: function (e) { self.setState({ couponInput: e.target.value.toUpperCase(), manualCouponError: null }); },
                        className: inputClass + ' flex-1 uppercase',
                        placeholder: t('checkout.couponPlaceholder'),
                        dir: 'ltr',
                      }),
                      React.createElement('button', {
                        type: 'button',
                        onClick: this.handleApplyCoupon,
                        disabled: couponApplying,
                        className: 'px-4 py-3 rounded-2xl bg-purple-50 text-sm font-bold text-purple-700 ring-1 ring-purple-100 transition-colors hover:bg-purple-100 disabled:opacity-50',
                      }, couponApplying ? t('checkout.applyingCoupon') : t('checkout.applyCoupon'))
                    ),
                    state.manualCouponError
                      ? React.createElement('p', { className: 'text-xs font-medium text-red-600' }, state.manualCouponError)
                      : (state.couponApplied
                          ? React.createElement('p', { className: 'text-xs font-medium text-green-700' }, t('checkout.couponAppliedShort', { code: state.couponApplied.code }))
                          : null)
                  )
            )
          : (productCoupon
              ? React.createElement('div', { className: 'pt-4' },
                  React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('checkout.coupon')),
                  React.createElement('div', {
                    className: 'rounded-xl px-4 py-3 border ' + (
                      state.couponError
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    ),
                  },
                    React.createElement('p', { className: 'font-semibold truncate ' + (state.couponError ? 'text-red-800' : 'text-green-800') }, productCoupon.code),
                    React.createElement('p', { className: 'text-sm mt-0.5 ' + (state.couponError ? 'text-red-700' : 'text-green-700') },
                      state.couponApplying
                        ? t('checkout.applyingCoupon')
                        : state.couponError
                          ? state.couponError
                          : appliedCoupon
                            ? (appliedCoupon.freeShipping
                                ? t('checkout.couponFreeShipping')
                                : t('checkout.couponDiscount', { amount: couponDiscount.toFixed(2) }))
                            : (productCoupon.description || '')
                    )
                  )
                )
              : null),

        React.createElement('div', { className: 'space-y-2 py-3' },
          React.createElement('div', { className: 'flex justify-between text-sm' },
            React.createElement('span', { className: 'text-gray-600' }, t('checkout.subtotal')),
            React.createElement('span', { className: 'text-gray-900' }, subtotal.toFixed(2) + ' DA')
          ),
          React.createElement('div', { className: 'flex justify-between text-sm' },
            React.createElement('span', { className: 'text-gray-600' }, t('checkout.shipping')),
            React.createElement('span', { className: 'text-gray-900' },
              form.deliveryCompanyId
                ? (shipping === 0 ? t('checkout.freeShipping') : shipping.toFixed(2) + ' DA')
                : '-'
            )
          ),
          appliedCoupon
            ? React.createElement('div', { className: 'flex justify-between text-sm' },
                React.createElement('span', { className: 'text-gray-600' }, t('checkout.discount') + ' (' + appliedCoupon.code + ')'),
                React.createElement('span', { className: 'text-green-600 font-medium' }, '-' + couponDiscount.toFixed(2) + ' DA')
              )
            : null,
          React.createElement('div', { className: 'flex justify-between text-base font-bold border-t border-gray-100 pt-2' },
            React.createElement('span', { className: 'text-gray-900' }, t('checkout.total')),
            React.createElement('span', { className: 'text-[#6C3DF2]' }, total.toFixed(2) + ' DA')
          )
        ),

        React.createElement('p', { className: 'text-xs text-gray-400 mt-3 text-center' }, t('checkout.codInfo')),

        hasUnavailableItem
          ? React.createElement('div', { className: 'mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800' },
              t('cart.availabilityError'))
          : null,

        React.createElement('button', {
          type: 'submit',
          disabled: state.submitting || couponApplying || hasUnavailableItem,
          className: 'w-full py-4 mt-5 bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        },
          state.submitting
            ? React.createElement('span', { className: 'flex items-center justify-center space-x-2' },
                React.createElement('span', { className: 'animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' }),
                React.createElement('span', null, t('checkout.submitting'))
              )
            : (allowCoupon ? t('checkout.placeOrder') : t('storefront.buyButton'))
        )
      )
    );
  }
}

export default withTranslation()(CheckoutPanel);
