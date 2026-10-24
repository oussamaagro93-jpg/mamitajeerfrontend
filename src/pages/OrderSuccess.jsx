import React from 'react';
import { withTranslation } from 'react-i18next';
import MetaPixel from '../utils/pixel';

function getQueryParam(search, name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(search || '');
  if (!match) return '';
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch (e) {
    return match[1];
  }
}

class OrderSuccess extends React.Component {
  constructor(props) {
    super(props);
    var order = null;
    try {
      var stored = sessionStorage.getItem('lastOrder');
      if (stored) order = JSON.parse(stored);
      if (order && String(order.orderNumber) !== String(props.match.params.orderNumber)) {
        order = null;
      }
    } catch (e) {}
    this.state = { order: order };
  }

  componentDidMount() {
    var orderNumber = this.props.match.params.orderNumber;
    var order = this.state.order;
    var value = order
      ? parseFloat(order.total) || 0
      : parseFloat(getQueryParam(this.props.location.search, 'value')) || 0;

    MetaPixel.purchase({
      event_id: orderNumber,
      order_id: orderNumber,
      currency: 'DZD',
      value: value,
    });
  }

  renderSummary() {
    var t = this.props.t;
    var order = this.state.order;
    if (!order) return null;

    var subtotal = parseFloat(order.subtotal) || 0;
    var discount = parseFloat(order.discountAmount) || 0;
    var shipping = parseFloat(order.shippingCost) || 0;
    var total = parseFloat(order.total) || 0;

    return React.createElement('div', { className: 'bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left' },
      React.createElement('div', { className: 'flex justify-between text-sm py-1' },
        React.createElement('span', { className: 'text-gray-600' }, t('checkout.subtotal')),
        React.createElement('span', { className: 'text-gray-900' }, subtotal.toFixed(2) + ' DA')
      ),
      discount > 0
        ? React.createElement('div', { className: 'flex justify-between text-sm py-1' },
            React.createElement('span', { className: 'text-gray-600' },
              t('checkout.discount') + (order.couponCode ? ' (' + order.couponCode + ')' : '')
            ),
            React.createElement('span', { className: 'text-green-600 font-medium' }, '-' + discount.toFixed(2) + ' DA')
          )
        : null,
      React.createElement('div', { className: 'flex justify-between text-sm py-1' },
        React.createElement('span', { className: 'text-gray-600' }, t('checkout.shipping')),
        React.createElement('span', { className: 'text-gray-900' }, shipping === 0 ? t('checkout.freeShipping') : shipping.toFixed(2) + ' DA')
      ),
      React.createElement('div', { className: 'flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2' },
        React.createElement('span', { className: 'text-gray-900' }, t('checkout.total')),
        React.createElement('span', { className: 'text-[#6C3DF2]' }, total.toFixed(2) + ' DA')
      )
    );
  }

  render() {
    var t = this.props.t;
    var orderNumber = this.props.match.params.orderNumber;
    var order = this.state.order;
    var search = (this.props.location && this.props.location.search) || '';
    var discoverUrl = '/order-complete/' + encodeURIComponent(orderNumber) + search;

    return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
      React.createElement('div', { className: 'max-w-md mx-auto px-4 text-center' },
        React.createElement('div', { className: 'bg-white rounded-2xl p-8 shadow-lg border border-gray-100' },
          React.createElement('div', { className: 'w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6' },
            React.createElement('svg', { className: 'w-10 h-10 text-green-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M5 13l4 4L19 7' })
            )
          ),

          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-3' }, t('checkout.success.title')),

          React.createElement('p', { className: 'text-gray-600 mb-2' }, t('checkout.success.message')),
          React.createElement('p', { className: 'text-lg font-semibold text-[#6C3DF2] mb-4' }, orderNumber),

          order && order.couponCode
            ? React.createElement('p', { className: 'inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-4' },
                t('checkout.couponAppliedShort', { code: order.couponCode })
              )
            : null,

          this.renderSummary(),

          React.createElement('div', { className: 'bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left' },
            React.createElement('p', { className: 'text-sm text-amber-800 font-medium mb-1' }, t('checkout.success.whatsNext')),
            React.createElement('ul', { className: 'text-sm text-amber-700 space-y-1 list-disc list-inside' },
              React.createElement('li', null, t('checkout.success.step1')),
              React.createElement('li', null, t('checkout.success.step2')),
              React.createElement('li', null, t('checkout.success.step3'))
            )
          ),

          React.createElement('a', {
            href: discoverUrl,
            className: 'inline-block w-full py-3 bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#6C3DF2]/30 transition-all text-center',
          }, t('checkout.success.continueShopping'))
        )
      )
    );
  }
}

export default withTranslation()(OrderSuccess);
