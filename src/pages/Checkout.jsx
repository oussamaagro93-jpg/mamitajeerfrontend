import React from 'react';
import { withTranslation } from 'react-i18next';
import { checkoutAPI, orderAPI, productAPI } from '../api';
import { publicShippingAPI } from '../api/shipping';
import { notify } from '../components/common/Toast';
import MetaPixel from '../utils/pixel';

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.shippingRequestId = 0;
    this.state = {
      loading: true,
      submitting: false,
      product: null,
      quantity: 1,
      error: null,
      wilayas: [],
      communes: [],
      shippingOptions: [],
      deliveryMethods: [],
      loadingDelivery: false,
      deliveryUnavailable: false,
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
      couponCode: '',
      couponApplied: null,
      couponApplying: false,
      couponError: null,
    };
  }

  componentDidMount() {
    var stored = sessionStorage.getItem('checkoutItem');
    if (!stored) {
      this.setState({ loading: false, error: 'No item to checkout' });
      return;
    }
    var self = this;
    try {
      var data = JSON.parse(stored);
      var prefillForm = {};
      if (data.customerForm) {
        if (data.customerForm.guestCity) prefillForm.guestCity = data.customerForm.guestCity;
        if (data.customerForm.city) prefillForm.guestCity = data.customerForm.city;
        if (data.customerForm.guestWilaya) prefillForm.guestWilaya = data.customerForm.guestWilaya;
        if (data.customerForm.wilayaId) prefillForm.wilayaId = data.customerForm.wilayaId;
        if (data.customerForm.communeId) prefillForm.communeId = data.customerForm.communeId;
        if (data.customerForm.address) prefillForm.guestAddress = data.customerForm.address;
        if (data.customerForm.note) prefillForm.notes = data.customerForm.note;
      }
      productAPI.getBySlug(data.slug).then(function (res) {
        var product = res.data.data.product;
        self.setState({
          product: product,
          quantity: data.quantity || 1,
          loading: false,
          form: Object.assign({}, self.state.form, prefillForm),
        }, function () {
          var qty = self.state.quantity;
          MetaPixel.initiateCheckout({
            content_ids: [String(product.id)],
            content_type: 'product',
            contents: [{ id: String(product.id), quantity: qty, item_price: parseFloat(product.price) }],
            currency: 'DZD',
            value: parseFloat(product.price) * qty,
            num_items: qty,
          });
          if (prefillForm.wilayaId) {
            publicShippingAPI.getCommunes(prefillForm.wilayaId).then(function (res) {
              self.setState({ communes: res.data.data.communes || [] });
            }).catch(function () {});
            self.fetchShippingOptions(prefillForm.wilayaId, prefillForm.communeId || '');
          }
        });
      }).catch(function () {
        self.setState({ loading: false, error: 'Product not found' });
      });
    } catch (e) {
      this.setState({ loading: false, error: 'Invalid checkout data' });
    }

    publicShippingAPI.getWilayas().then(function (res) {
      self.setState({ wilayas: res.data.data.wilayas || [] });
    }).catch(function () {});
  }

  handleFormChange(key, value) {
    if (typeof key === 'object') {
      var form = Object.assign({}, this.state.form, key);
      this.setState({ form: form });
      if (key.wilayaId !== undefined) {
        this.setState({ communes: [], form: Object.assign({}, form, { communeId: '' }), shippingOptions: [], deliveryUnavailable: false, shippingPrice: 0 });
        if (key.wilayaId) {
          var self = this;
          publicShippingAPI.getCommunes(key.wilayaId).then(function (res) {
            self.setState({ communes: res.data.data.communes || [] });
          }).catch(function () {});
        }
      }
      if (key.wilayaId !== undefined || key.communeId !== undefined) {
        this.fetchShippingOptions(form.wilayaId, form.communeId);
      }
      return;
    }

    var form = Object.assign({}, this.state.form, { [key]: value });
    this.setState({ form: form });

    if (key === 'wilayaId') {
      this.setState({ communes: [], form: Object.assign({}, form, { communeId: '' }), shippingOptions: [], deliveryUnavailable: false, shippingPrice: 0 });
      if (value) {
        var self = this;
        publicShippingAPI.getCommunes(value).then(function (res) {
          self.setState({ communes: res.data.data.communes || [] });
        }).catch(function () {});
      }
    }

    if (key === 'wilayaId' || key === 'communeId') {
      this.fetchShippingOptions(form.wilayaId, key === 'communeId' ? form.communeId : '');
    }
  }

  resetDelivery() {
    this.shippingRequestId++;
    this.setState(function (prev) {
      return {
        shippingOptions: [],
        deliveryMethods: [],
        loadingDelivery: false,
        shippingPrice: 0,
        deliveryUnavailable: false,
        form: Object.assign({}, prev.form, { deliveryCompanyId: '', deliveryType: 'home_delivery' }),
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
    var product = this.state.product;
    var params = { wilayaId: wilayaId };
    if (communeId) params.communeId = communeId;
    if (product && product.deliveryCompanyId) params.deliveryCompanyId = product.deliveryCompanyId;

    // Clear the old price while the new destination's price is loading.
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
      if (requestId !== self.shippingRequestId) return;

      var options = res.data.data.options || [];
      var currentProduct = self.state.product;
      var preferredCompanyId = currentProduct && currentProduct.deliveryCompanyId
        ? String(currentProduct.deliveryCompanyId)
        : null;

      // Use the delivery company selected on the product. Products created
      // before this feature have no company, so keep the first option as a
      // fallback instead of blocking their checkout.
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
            shippingOptions: options,
            deliveryMethods: [],
            loadingDelivery: false,
            shippingPrice: 0,
            deliveryUnavailable: true,
            form: Object.assign({}, prev.form, { deliveryCompanyId: '' }),
          };
        });
        return;
      }

      // Keep the client's selected method when the new destination supports
      // it, otherwise fall back to Home Delivery and then the first option.
      var desiredType = self.state.form.deliveryType || 'home_delivery';
      var method = methods.find(function (m) { return m.type === desiredType; })
        || methods.find(function (m) { return m.type === 'home_delivery'; })
        || methods[0];

      self.setState(function (prev) {
        return {
          shippingOptions: options,
          deliveryMethods: methods,
          loadingDelivery: false,
          shippingPrice: method.price,
          deliveryUnavailable: false,
          form: Object.assign({}, prev.form, {
            deliveryCompanyId: selected.deliveryCompanyId,
            deliveryType: method.type,
          }),
        };
      });
    }).catch(function () {
      if (requestId !== self.shippingRequestId) return;
      self.setState(function (prev) {
        return {
          shippingOptions: [],
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
        shippingPrice: method.price,
        form: Object.assign({}, prev.form, { deliveryType: type }),
      };
    });
  }

  handleCouponCodeChange(value) {
    this.setState({ couponCode: value.toUpperCase(), couponError: null });
  }

  applyCoupon() {
    var t = this.props.t;
    var self = this;
    var product = this.state.product;
    var code = (this.state.couponCode || '').trim();

    if (!product) return;
    if (!code) {
      this.setState({ couponError: t('checkout.couponRequired') });
      return;
    }

    this.setState({ couponApplying: true, couponError: null });
    orderAPI.validateCoupon({
      code: code,
      items: [{ productId: product.id, quantity: this.state.quantity }],
    }).then(function (res) {
      var data = res.data.data;
      var applied = {
        code: data.coupon.code,
        discount: parseFloat(data.discount) || 0,
        freeShipping: !!data.freeShipping,
      };
      self.setState({
        couponApplying: false,
        couponApplied: applied,
        couponCode: applied.code,
        couponError: null,
      });
      notify(t('checkout.couponApplied', { code: applied.code }), 'success');
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('checkout.couponInvalid');
      self.setState({ couponApplying: false, couponApplied: null, couponError: message });
      notify(message, 'error');
    });
  }

  removeCoupon() {
    this.setState({ couponApplied: null, couponCode: '', couponError: null });
  }

  handleSubmit(e) {
    e.preventDefault();
    var t = this.props.t;
    var self = this;
    var form = this.state.form;
    var product = this.state.product;
    var quantity = this.state.quantity;

    if (!form.guestName || !form.guestPhone || !form.wilayaId || !form.communeId || !form.guestAddress) {
      notify(t('checkout.fillRequired'), 'error');
      return;
    }
    if (!form.deliveryCompanyId || !form.deliveryType) {
      notify(t('checkout.deliveryUnavailable'), 'error');
      return;
    }

    this.setState({ submitting: true });

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
      sessionStorage.removeItem('checkoutItem');
      var order = res.data.data.order;
      var orderNumber = order.orderNumber;
      var orderTotal = parseFloat(order.total);

      try {
        sessionStorage.setItem('lastOrder', JSON.stringify(order));
      } catch (e) {}

      // Pass the purchased product's category so the new page can recommend
      // other products from the same category.
      var query = [];
      if (product.categoryId) query.push('categoryId=' + encodeURIComponent(product.categoryId));
      if (product.category && product.category.name) query.push('categoryName=' + encodeURIComponent(product.category.name));
      query.push('productId=' + encodeURIComponent(product.id));
      query.push('value=' + encodeURIComponent(orderTotal.toFixed(2)));

      self.props.history.push('/order-success/' + encodeURIComponent(orderNumber) + '?' + query.join('&'));
    }).catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.message) || t('checkout.error');
      notify(msg, 'error');
      self.setState({ submitting: false });
    });
  }

  render() {
    var t = this.props.t;
    var state = this.state;
    var self = this;

    if (state.loading) {
      return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-4 border-[#6C3DF2] border-t-transparent' })
      );
    }

    if (state.error && !state.product) {
      return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
        React.createElement('div', { className: 'text-center p-8' },
          React.createElement('p', { className: 'text-gray-600 text-lg mb-4' }, state.error),
          React.createElement('a', { href: '/', className: 'text-[#6C3DF2] font-medium hover:underline' }, t('checkout.backToStore'))
        )
      );
    }

    var product = state.product;
    var form = state.form;
    var wilayas = state.wilayas;
    var communes = state.communes;
    var subtotal = parseFloat(product.price) * state.quantity;
    var appliedCoupon = state.couponApplied;
    var couponDiscount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
    var shipping = appliedCoupon && appliedCoupon.freeShipping ? 0 : state.shippingPrice;
    var total = Math.max(0, subtotal + shipping - couponDiscount);

    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
      React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8' },

        React.createElement('a', { href: '/', className: 'inline-flex items-center text-sm text-gray-500 hover:text-[#6C3DF2] mb-6 transition-colors' },
          React.createElement('svg', { className: 'w-4 h-4 mr-1', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 19l-7-7 7-7' })
          ),
          t('checkout.backToStore')
        ),

        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-8' }, t('checkout.title')),

        React.createElement('form', { onSubmit: function (e) { self.handleSubmit(e); } },
          React.createElement('div', { className: 'space-y-8' },

            // Customer Info
            React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border border-gray-100' },
              React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('checkout.shippingInfo')),

              React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.fullName')),
                  React.createElement('input', {
                    type: 'text',
                    value: form.guestName,
                    onChange: function (e) { self.handleFormChange('guestName', e.target.value); },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors',
                    placeholder: t('checkout.fullNamePlaceholder'),
                    required: true,
                  })
                ),

                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.phone')),
                  React.createElement('input', {
                    type: 'tel',
                    value: form.guestPhone,
                    onChange: function (e) { self.handleFormChange('guestPhone', e.target.value); },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors',
                    placeholder: t('checkout.phonePlaceholder'),
                    required: true,
                    dir: 'ltr',
                  })
                ),

                // Wilaya select
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.wilaya')),
                  React.createElement('select', {
                    value: form.wilayaId,
                    onChange: function (e) {
                      var value = e.target.value;
                      var wilaya = wilayas.find(function (w) { return String(w.id) === String(value); });
                      self.handleFormChange({
                        wilayaId: value,
                        guestWilaya: wilaya ? (wilaya.nameFr || wilaya.name) : '',
                        communeId: '',
                        guestCity: '',
                      });
                    },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors bg-white',
                    required: true,
                  },
                    React.createElement('option', { value: '' }, t('checkout.selectWilaya')),
                    wilayas.map(function (w) {
                      return React.createElement('option', { key: w.id, value: w.id }, w.nameFr + ' - ' + w.nameAr);
                    })
                  )
                ),

                // Commune select
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.commune')),
                  React.createElement('select', {
                    value: form.communeId,
                    onChange: function (e) {
                      var value = e.target.value;
                      var commune = communes.find(function (c) { return String(c.id) === String(value); });
                      self.handleFormChange({
                        communeId: value,
                        guestCity: commune ? (commune.nameFr || commune.name) : '',
                      });
                    },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors bg-white',
                    required: true,
                    disabled: communes.length === 0,
                  },
                    React.createElement('option', { value: '' }, communes.length === 0 ? t('checkout.selectWilayaFirst') : t('checkout.selectCommune')),
                    communes.map(function (c) {
                      return React.createElement('option', { key: c.id, value: c.id }, c.nameFr + ' - ' + c.nameAr);
                    })
                  )
                ),

                // Address
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.address')),
                  React.createElement('textarea', {
                    value: form.guestAddress,
                    onChange: function (e) { self.handleFormChange('guestAddress', e.target.value); },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors resize-none',
                    placeholder: t('checkout.addressPlaceholder'),
                    rows: 3,
                    required: true,
                  })
                ),

                // Note
                React.createElement('div', null,
                  React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, t('checkout.note')),
                  React.createElement('textarea', {
                    value: form.notes,
                    onChange: function (e) { self.handleFormChange('notes', e.target.value); },
                    className: 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors resize-none',
                    placeholder: t('checkout.notePlaceholder'),
                    rows: 2,
                  })
                ),
              )
            ),

            // Delivery method: prices come from the product's delivery company,
            // but the company name is never shown to the client.
            React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border border-gray-100' },
              React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('checkout.deliveryMethod')),

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
                              React.createElement('p', { className: 'font-bold text-[#6C3DF2] whitespace-nowrap' }, method.price.toFixed(2) + ' DA')
                            )
                          );
                        })
                      )
            ),

            // Coupon
            React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border border-gray-100' },
              React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-4' }, t('checkout.coupon')),
              appliedCoupon
                ? React.createElement('div', { className: 'flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3' },
                    React.createElement('div', { className: 'min-w-0' },
                      React.createElement('p', { className: 'font-semibold text-green-800 truncate' }, appliedCoupon.code),
                      React.createElement('p', { className: 'text-sm text-green-700 mt-0.5' },
                        appliedCoupon.freeShipping
                          ? t('checkout.couponFreeShipping')
                          : t('checkout.couponDiscount', { amount: couponDiscount.toFixed(2) })
                      )
                    ),
                    React.createElement('button', {
                      type: 'button',
                      onClick: function () { self.removeCoupon(); },
                      className: 'text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap',
                    }, t('checkout.removeCoupon'))
                  )
                : React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3' },
                    React.createElement('input', {
                      type: 'text',
                      value: state.couponCode,
                      onChange: function (e) { self.handleCouponCodeChange(e.target.value); },
                      className: 'flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base uppercase focus:outline-none focus:ring-2 focus:ring-[#6C3DF2]/40 focus:border-[#6C3DF2] transition-colors',
                      placeholder: t('checkout.couponPlaceholder'),
                      disabled: state.couponApplying,
                    }),
                    React.createElement('button', {
                      type: 'button',
                      onClick: function () { self.applyCoupon(); },
                      disabled: state.couponApplying || !state.couponCode.trim(),
                      className: 'px-5 py-3 rounded-xl bg-[#6C3DF2] text-white font-semibold hover:bg-[#5B21B6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap',
                    }, state.couponApplying ? t('checkout.applyingCoupon') : t('checkout.applyCoupon'))
                  ),
              state.couponError
                ? React.createElement('p', { className: 'text-sm text-red-600 mt-2' }, state.couponError)
                : null
            ),

            // Order Summary
            React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border border-gray-100' },
              React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('checkout.orderSummary')),

              React.createElement('div', { className: 'flex items-center space-x-4 py-3 border-b border-gray-100' },
                product.images && product.images.length > 0
                  ? React.createElement('img', { src: product.images[0].url, alt: product.name, className: 'w-16 h-16 rounded-xl object-cover' })
                  : React.createElement('div', { className: 'w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center' },
                      React.createElement('svg', { className: 'w-8 h-8 text-gray-300', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                        React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
                      )
                    ),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('p', { className: 'font-medium text-gray-900' }, product.name),
                  React.createElement('p', { className: 'text-sm text-gray-500' }, t('checkout.quantityLabel') + ' ' + state.quantity)
                ),
                React.createElement('p', { className: 'font-bold text-gray-900' }, subtotal.toFixed(2) + ' DA')
              ),

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

              React.createElement('p', { className: 'text-xs text-gray-400 mt-3 text-center' }, t('checkout.codInfo'))
            ),

            React.createElement('button', {
              type: 'submit',
              disabled: state.submitting,
              className: 'w-full py-4 bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:shadow-[#6C3DF2]/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed',
            },
              state.submitting
                ? React.createElement('span', { className: 'flex items-center justify-center space-x-2' },
                    React.createElement('span', { className: 'animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent' }),
                    React.createElement('span', null, t('checkout.submitting'))
                  )
                : t('checkout.confirmOrder')
            )
          )
        )
      )
    );
  }
}

export default withTranslation()(Checkout);
