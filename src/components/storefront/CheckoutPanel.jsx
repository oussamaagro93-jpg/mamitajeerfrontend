import React from 'react';
import { withTranslation } from 'react-i18next';
import { checkoutAPI, orderAPI } from '../../api';
import { publicShippingAPI } from '../../api/shipping';
import { notify } from '../common/Toast';
import MetaPixel from '../../utils/pixel';

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
    };
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleWilayaChange = this.handleWilayaChange.bind(this);
    this.handleCommuneChange = this.handleCommuneChange.bind(this);
    this.handleDeliveryTypeChange = this.handleDeliveryTypeChange.bind(this);
    this.submit = this.submit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    this.syncAssignedCoupon(this.props.product, this.props.quantity);
  }

  componentDidUpdate(prevProps) {
    var productChanged = prevProps.product && this.props.product &&
      prevProps.product.id !== this.props.product.id;
    var quantityChanged = prevProps.quantity !== this.props.quantity;

    if (productChanged) {
      if (this.state.form.wilayaId) {
        this.fetchShippingOptions(this.state.form.wilayaId, this.state.form.communeId);
      }
    }

    if (productChanged || quantityChanged) {
      this.syncAssignedCoupon(this.props.product, this.props.quantity);
    }
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
    var product = this.props.product;
    var params = { wilayaId: wilayaId };
    if (communeId) params.communeId = communeId;
    if (product && product.deliveryCompanyId) {
      params.deliveryCompanyId = product.deliveryCompanyId;
    }

    this.setState(function (prev) {
      return {
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
      var currentProduct = self.props.product;
      var preferredCompanyId = currentProduct && currentProduct.deliveryCompanyId
        ? String(currentProduct.deliveryCompanyId)
        : null;

      var selected = null;
      if (preferredCompanyId) {
        selected = options.find(function (option) {
          return String(option.deliveryCompanyId) === preferredCompanyId;
        });
      } else {
        selected = options[0] || null;
      }

      var methods = selected && selected.methods ? selected.methods : [];

      if (!selected || methods.length === 0) {
        self.setState(function (prev) {
          return {
            deliveryMethods: [],
            loadingDelivery: false,
            shippingPrice: 0,
            deliveryUnavailable: true,
            form: Object.assign({}, prev.form, { deliveryCompanyId: '' }),
          };
        });
        return;
      }

      var desiredType = self.state.form.deliveryType || 'home_delivery';
      var method = methods.find(function (m) { return m.type === desiredType; })
        || methods.find(function (m) { return m.type === 'home_delivery'; })
        || methods[0];

      self.setState(function (prev) {
        return {
          deliveryMethods: methods,
          loadingDelivery: false,
          shippingPrice: Number(method.price) || 0,
          deliveryUnavailable: false,
          form: Object.assign({}, prev.form, {
            deliveryCompanyId: selected.deliveryCompanyId,
            deliveryType: method.type,
          }),
        };
      });
    }).catch(function () {
      if (!self.mounted || requestId !== self.shippingRequestId) return;
      self.setState(function (prev) {
        return {
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
    var method = this.state.deliveryMethods.find(function (m) { return m.type === type; });
    if (!method) return;
    this.setState(function (prev) {
      return {
        shippingPrice: Number(method.price) || 0,
        form: Object.assign({}, prev.form, { deliveryType: type }),
      };
    });
  }

  syncAssignedCoupon(product, quantity) {
    var self = this;
    var t = this.props.t;
    var coupon = product && product.coupon;
    var requestId = ++this.couponRequestId;

    if (!coupon || !coupon.code) {
      this.setState({ couponApplied: null, couponApplying: false, couponError: null });
      return;
    }

    this.setState({ couponApplied: null, couponApplying: true, couponError: null });
    orderAPI.validateCoupon({
      code: coupon.code,
      items: [{ productId: product.id, quantity: quantity }],
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

  handleSubmit(event) {
    event.preventDefault();
    this.submit();
  }

  submit() {
    if (this.submitting || this.state.couponApplying) return;

    var t = this.props.t;
    var self = this;
    var form = this.state.form;
    var product = this.props.product;
    var quantity = this.props.quantity;

    if (!product) return;
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

    var subtotal = parseFloat(product.price) * quantity;
    MetaPixel.addToCart({
      content_ids: [String(product.id)],
      content_type: 'product',
      contents: [{ id: String(product.id), quantity: quantity, item_price: parseFloat(product.price) }],
      currency: 'DZD',
      value: subtotal,
    });
    MetaPixel.initiateCheckout({
      content_ids: [String(product.id)],
      content_type: 'product',
      contents: [{ id: String(product.id), quantity: quantity, item_price: parseFloat(product.price) }],
      currency: 'DZD',
      value: subtotal,
      num_items: quantity,
    });

    var payload = {
      items: [{ productId: product.id, quantity: quantity }],
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

    if (this.state.couponApplied) {
      payload.couponCode = this.state.couponApplied.code;
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
    var product = this.props.product;
    var quantity = this.props.quantity;
    var form = this.state.form;
    var state = this.state;
    var self = this;

    if (!product) return null;

    var subtotal = parseFloat(product.price) * quantity;
    var assignedCoupon = product.coupon;
    var appliedCoupon = state.couponApplied;
    var couponDiscount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
    var shipping = appliedCoupon && appliedCoupon.freeShipping ? 0 : (Number(state.shippingPrice) || 0);
    var total = Math.max(0, subtotal + shipping - couponDiscount);
    var productImage = product.image || (product.images && product.images.length > 0 ? product.images[0].url : null);

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

        React.createElement('div', { className: 'flex items-center space-x-4 py-3 border-b border-gray-100' },
          productImage
            ? React.createElement('img', { src: productImage, alt: product.name, className: 'w-16 h-16 rounded-2xl object-cover ring-1 ring-purple-100' })
            : React.createElement('div', { className: 'w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center' },
                React.createElement('svg', { className: 'w-8 h-8 text-gray-300', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
                )
              ),
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', { className: 'font-medium text-gray-900' }, product.name),
            React.createElement('p', { className: 'text-sm text-gray-500' }, t('checkout.quantityLabel') + ' ' + quantity)
          ),
          React.createElement('p', { className: 'font-bold text-gray-900 whitespace-nowrap' }, subtotal.toFixed(2) + ' DA')
        ),

        // Only the coupon assigned to this product is shown. Products without
        // an assigned coupon do not render this section at all.
        assignedCoupon
          ? React.createElement('div', { className: 'pt-4' },
              React.createElement('h3', { className: 'text-sm font-semibold text-gray-900 mb-3' }, t('checkout.coupon')),
              React.createElement('div', {
                className: 'rounded-xl px-4 py-3 border ' + (
                  state.couponError
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                ),
              },
                React.createElement('p', { className: 'font-semibold truncate ' + (state.couponError ? 'text-red-800' : 'text-green-800') }, assignedCoupon.code),
                React.createElement('p', { className: 'text-sm mt-0.5 ' + (state.couponError ? 'text-red-700' : 'text-green-700') },
                  state.couponApplying
                    ? t('checkout.applyingCoupon')
                    : state.couponError
                      ? state.couponError
                      : appliedCoupon
                        ? (appliedCoupon.freeShipping
                            ? t('checkout.couponFreeShipping')
                            : t('checkout.couponDiscount', { amount: couponDiscount.toFixed(2) }))
                        : (assignedCoupon.description || '')
                )
              )
            )
          : null,

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

        React.createElement('button', {
          type: 'submit',
          disabled: state.submitting || state.couponApplying,
          className: 'w-full py-4 mt-5 bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        },
          state.submitting
            ? React.createElement('span', { className: 'flex items-center justify-center space-x-2' },
                React.createElement('span', { className: 'animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' }),
                React.createElement('span', null, t('checkout.submitting'))
              )
            : t('storefront.buyButton')
        )
      )
    );
  }
}

export default withTranslation()(CheckoutPanel);
