import React from 'react';
import { withTranslation } from 'react-i18next';
import { checkoutAPI, productAPI } from '../api';
import { publicShippingAPI } from '../api/shipping';
import { notify } from '../components/common/Toast';
import MetaPixel from '../utils/pixel';

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      submitting: false,
      product: null,
      quantity: 1,
      error: null,
      wilayas: [],
      communes: [],
      shippingOptions: [],
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
      selectedOption: null,
      shippingPrice: 0,
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
        this.setState({ communes: [], form: Object.assign({}, form, { communeId: '' }), shippingOptions: [], selectedOption: null, shippingPrice: 0 });
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
      this.setState({ communes: [], form: Object.assign({}, form, { communeId: '' }), shippingOptions: [], selectedOption: null, shippingPrice: 0 });
      if (value) {
        var self = this;
        publicShippingAPI.getCommunes(value).then(function (res) {
          self.setState({ communes: res.data.data.communes || [] });
        }).catch(function () {});
      }
    }

    if (key === 'wilayaId' || key === 'communeId') {
      this.fetchShippingOptions(form.wilayaId, key === 'communeId' ? form.communeId : this.state.form.communeId);
    }
  }

  fetchShippingOptions(wilayaId, communeId) {
    if (!wilayaId) return;
    var self = this;
    var params = { wilayaId: wilayaId };
    if (communeId) params.communeId = communeId;
    publicShippingAPI.getShippingOptions(params).then(function (res) {
      var options = res.data.data.options || [];
      self.setState({ shippingOptions: options, selectedOption: null, shippingPrice: 0,
        form: Object.assign({}, self.state.form, { deliveryCompanyId: '', deliveryType: 'home_delivery' })
      });
    }).catch(function () {});
  }

  selectDeliveryOption(companyId, method) {
    this.setState({
      form: Object.assign({}, this.state.form, { deliveryCompanyId: companyId, deliveryType: method.type }),
      selectedOption: { companyId: companyId, method: method },
      shippingPrice: method.price,
    });
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
    if (!form.deliveryCompanyId) {
      notify(t('checkout.selectDelivery'), 'error');
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

    checkoutAPI.guestCheckout(payload).then(function (res) {
      sessionStorage.removeItem('checkoutItem');
      var orderNumber = res.data.data.order.orderNumber;
      self.props.history.push('/order-success/' + orderNumber);
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
    var shipping = state.shippingPrice;
    var total = subtotal + shipping;

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

            // Delivery Company Selection
            state.shippingOptions.length > 0
              ? React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border border-gray-100' },
                  React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-5' }, t('checkout.deliveryMethod')),
                  React.createElement('div', { className: 'space-y-3' },
                    state.shippingOptions.map(function (company) {
                      return company.methods.map(function (method) {
                        var isSelected = state.selectedOption && state.selectedOption.companyId === company.deliveryCompanyId && state.selectedOption.method.type === method.type;
                        return React.createElement('div', {
                          key: company.deliveryCompanyId + '-' + method.type,
                          onClick: function () { self.selectDeliveryOption(company.deliveryCompanyId, method); },
                          className: 'p-4 border-2 rounded-xl cursor-pointer transition-all ' + (
                            isSelected
                              ? 'border-[#6C3DF2] bg-[#6C3DF2]/5'
                              : 'border-gray-200 hover:border-[#6C3DF2]/40 hover:bg-gray-50'
                          ),
                        },
                          React.createElement('div', { className: 'flex items-center justify-between' },
                            React.createElement('div', { className: 'flex items-center space-x-3' },
                              React.createElement('div', { className: 'w-5 h-5 rounded-full border-2 flex items-center justify-center ' + (isSelected ? 'border-[#6C3DF2]' : 'border-gray-300') },
                                isSelected ? React.createElement('div', { className: 'w-3 h-3 rounded-full bg-[#6C3DF2]' }) : null
                              ),
                              React.createElement('div', null,
                                React.createElement('p', { className: 'font-medium text-gray-900' }, company.deliveryCompanyName),
                                React.createElement('p', { className: 'text-sm text-gray-500' }, method.label + (method.estimatedDaysMin ? ' (' + method.estimatedDaysMin + '-' + method.estimatedDaysMax + ' ' + t('checkout.days') + ')' : ''))
                              )
                            ),
                            React.createElement('p', { className: 'font-bold text-lg text-[#6C3DF2]' }, method.price.toFixed(2) + ' DA')
                          )
                        );
                      });
                    })
                  )
                )
              : null,

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
                  React.createElement('span', { className: 'text-gray-900' }, shipping === 0 ? t('checkout.freeShipping') : shipping.toFixed(2) + ' DA')
                ),
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
