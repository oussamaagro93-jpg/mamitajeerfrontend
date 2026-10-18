import React from 'react';
import { withTranslation } from 'react-i18next';

class PriceSection extends React.Component {
  render() {
    var t = this.props.t;
    var price = this.props.price;
    var comparePrice = this.props.comparePrice;

    if (price === undefined || price === null) return null;

    var formattedPrice = parseFloat(price).toFixed(2) + ' DA';

    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20' },
      React.createElement('p', { className: 'text-sm font-medium text-gray-500 mb-1' }, t('storefront.price.label')),
      React.createElement('div', { className: 'flex items-center space-x-3' },
        React.createElement('span', { className: 'text-3xl font-bold text-[#6C3DF2]' }, formattedPrice),
        comparePrice && React.createElement('span', { className: 'text-lg text-gray-400 line-through' },
          parseFloat(comparePrice).toFixed(2) + ' DA'
        )
      )
    );
  }
}

export default withTranslation()(PriceSection);
