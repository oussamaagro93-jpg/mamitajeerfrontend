import React from 'react';
import { withTranslation } from 'react-i18next';

class PriceSection extends React.Component {
  render() {
    var t = this.props.t;
    var price = this.props.price;
    var comparePrice = this.props.comparePrice;

    if (price === undefined || price === null) return null;

    var numericPrice = parseFloat(price) || 0;
    var numericComparePrice = parseFloat(comparePrice) || 0;
    var discountPercent = numericComparePrice > numericPrice
      ? Math.round(((numericComparePrice - numericPrice) / numericComparePrice) * 100)
      : 0;
    var formattedPrice = numericPrice.toFixed(2) + ' DA';

    return React.createElement('div', { className: 'product-surface relative overflow-hidden p-5 sm:p-6' },
      React.createElement('div', { className: 'pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-100/70 blur-2xl' }),
      React.createElement('p', { className: 'text-xs font-semibold uppercase tracking-[0.14em] text-gray-500' }, t('storefront.price.label')),
      React.createElement('div', { className: 'mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2' },
        React.createElement('span', { className: 'text-3xl sm:text-4xl font-extrabold tracking-tight text-purple-700' }, formattedPrice),
        comparePrice
          ? React.createElement('span', { className: 'text-base sm:text-lg text-gray-400 line-through decoration-gray-300' },
              parseFloat(comparePrice).toFixed(2) + ' DA'
            )
          : null,
        discountPercent > 0
          ? React.createElement('span', {
              className: 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100',
            }, '-' + discountPercent + '%')
          : null
      )
    );
  }
}

export default withTranslation()(PriceSection);
