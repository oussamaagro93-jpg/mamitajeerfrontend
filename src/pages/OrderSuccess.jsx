import React from 'react';
import { withTranslation } from 'react-i18next';
import MetaPixel from '../utils/pixel';

class OrderSuccess extends React.Component {
  componentDidMount() {
    MetaPixel.purchase({
      event_id: this.props.match.params.orderNumber,
      order_id: this.props.match.params.orderNumber,
      currency: 'DZD',
      value: 0,
    });
  }

  render() {
    var t = this.props.t;
    var orderNumber = this.props.match.params.orderNumber;

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
          React.createElement('p', { className: 'text-lg font-semibold text-[#6C3DF2] mb-6' }, orderNumber),

          React.createElement('div', { className: 'bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left' },
            React.createElement('p', { className: 'text-sm text-amber-800 font-medium mb-1' }, t('checkout.success.whatsNext')),
            React.createElement('ul', { className: 'text-sm text-amber-700 space-y-1 list-disc list-inside' },
              React.createElement('li', null, t('checkout.success.step1')),
              React.createElement('li', null, t('checkout.success.step2')),
              React.createElement('li', null, t('checkout.success.step3')),
            )
          ),

          React.createElement('a', {
            href: '/',
            className: 'inline-block w-full py-3 bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#6C3DF2]/30 transition-all text-center',
          }, t('checkout.success.continueShopping'))
        )
      )
    );
  }
}

export default withTranslation()(OrderSuccess);
