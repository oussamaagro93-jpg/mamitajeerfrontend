import React from 'react';
import { withTranslation } from 'react-i18next';

class QuantitySelector extends React.Component {
  render() {
    var t = this.props.t;
    var quantity = this.props.quantity || 1;
    var onChange = this.props.onChange || function () {};

    var btnClass = 'w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-700 font-bold text-xl shadow-sm ring-1 ring-purple-100 hover:bg-purple-600 hover:text-white hover:shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-purple-700';

    return React.createElement('div', { className: 'product-surface p-5 sm:p-6' },
      React.createElement('div', { className: 'flex items-center justify-between gap-4' },
        React.createElement('p', { className: 'text-sm font-semibold text-gray-900' }, t('storefront.quantity.title')),

        React.createElement('div', { className: 'flex items-center gap-1.5 rounded-2xl bg-purple-50/80 p-1.5 ring-1 ring-purple-100/80' },
          React.createElement('button', {
            onClick: function () { if (quantity > 1) onChange(quantity - 1); },
            className: btnClass,
            disabled: quantity <= 1,
            'aria-label': t('common.previous'),
          }, '-'),

          React.createElement('span', {
            className: 'text-xl font-bold text-gray-900 min-w-[2.75rem] text-center tabular-nums',
            key: quantity,
          }, quantity),

          React.createElement('button', {
            onClick: function () { onChange(quantity + 1); },
            className: btnClass,
            'aria-label': t('common.next'),
          }, '+')
        )
      )
    );
  }
}

export default withTranslation()(QuantitySelector);
