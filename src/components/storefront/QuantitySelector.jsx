import React from 'react';
import { withTranslation } from 'react-i18next';

class QuantitySelector extends React.Component {
  render() {
    var t = this.props.t;
    var quantity = this.props.quantity || 1;
    var onChange = this.props.onChange || function () {};

    var btnClass = 'w-11 h-11 bg-white border-2 border-[#6C3DF2]/30 rounded-full flex items-center justify-center text-[#6C3DF2] font-bold text-lg hover:bg-[#6C3DF2] hover:text-white transition-all active:scale-95';

    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20' },
      React.createElement('p', { className: 'text-sm font-medium text-gray-500 mb-3' }, t('storefront.quantity.title')),

      React.createElement('div', { className: 'flex items-center justify-center space-x-4' },
        React.createElement('button', {
          onClick: function () { if (quantity > 1) onChange(quantity - 1); },
          className: btnClass,
          disabled: quantity <= 1,
          style: quantity <= 1 ? { opacity: 0.4, cursor: 'not-allowed' } : {},
        }, '-'),

        React.createElement('span', {
          className: 'text-2xl font-bold text-gray-900 min-w-[3rem] text-center',
          key: quantity,
        }, quantity),

        React.createElement('button', {
          onClick: function () { onChange(quantity + 1); },
          className: btnClass,
        }, '+')
      )
    );
  }
}

export default withTranslation()(QuantitySelector);
