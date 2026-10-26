import React from 'react';
import { withTranslation } from 'react-i18next';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import CartContext from '../../context/CartContext';
import { notify } from '../common/Toast';

class AddToCartButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();

    var t = this.props.t;
    var cart = this.context;
    var product = this.props.product;
    if (!cart || !product) return;

    var result = cart.addItem(product, this.props.quantity || 1);
    if (result.error === 'maxStock') {
      var max = product.quantity;
      notify(t('cart.errors.maxStock', { count: max }), 'error');
      return;
    }
    if (result.error) {
      notify(t('cart.errors.' + result.error), 'error');
      return;
    }
    notify(t('cart.added'));
    if (this.props.onAdded) this.props.onAdded(result.item);
  }

  render() {
    var t = this.props.t;
    var product = this.props.product;
    var stock = product ? parseInt(product.quantity, 10) : null;
    var soldOut = Number.isInteger(stock) && stock <= 0;
    var disabled = this.props.disabled || soldOut || !product;
    var full = this.props.full !== false;

    var className = this.props.className || '';
    if (!className) {
      className = full
        ? 'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/15 transition-all hover:shadow-xl hover:shadow-purple-900/25 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
        : 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 ring-1 ring-purple-100 transition-all hover:bg-purple-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';
    }

    return React.createElement('button', {
      type: 'button',
      onClick: this.handleClick,
      disabled: disabled,
      className: className,
      'aria-label': t('cart.addToCart'),
    },
      React.createElement(ShoppingBagIcon, { className: full ? 'h-5 w-5' : 'h-4 w-4' }),
      React.createElement('span', null, soldOut ? t('cart.outOfStock') : (this.props.label || t('cart.addToCart')))
    );
  }
}

AddToCartButton.contextType = CartContext;

export default withTranslation()(AddToCartButton);
