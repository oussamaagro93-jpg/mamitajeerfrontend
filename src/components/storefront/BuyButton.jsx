import React from 'react';
import { withTranslation } from 'react-i18next';

class BuyButton extends React.Component {
  render() {
    var t = this.props.t;
    var onClick = this.props.onClick || function () {};
    var fullWidth = this.props.fullWidth !== false;
    var size = this.props.size || 'normal';

    var sizeClass = size === 'large'
      ? 'py-4 text-lg rounded-2xl'
      : 'py-3 text-base rounded-xl';

    return React.createElement('button', {
      onClick: onClick,
      className: 'bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white font-bold ' +
        sizeClass + ' shadow-lg hover:shadow-xl hover:shadow-[#6C3DF2]/30 ' +
        'hover:scale-[1.02] active:scale-[0.98] transition-all ' +
        (fullWidth ? 'w-full' : ''),
    }, t('storefront.buyButton'));
  }
}

export default withTranslation()(BuyButton);
