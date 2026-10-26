import React from 'react';
import {
  CART_STORAGE_KEY,
  addItemToCart,
  cartCheckoutItems,
  cartHasUnavailableItems,
  cartItemCount,
  cartSubtotal,
  loadCart,
  removeItemFromCart,
  sanitizeCartItems,
  saveCart,
  updateItemQuantity,
} from '../utils/cart';

var CartContext = React.createContext(null);

function getStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

export class CartProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: loadCart(getStorage()) };
    this.addItem = this.addItem.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.replaceItems = this.replaceItems.bind(this);
    this.clear = this.clear.bind(this);
    this.handleStorage = this.handleStorage.bind(this);
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorage);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorage);
    }
  }

  handleStorage(event) {
    if (event.key !== CART_STORAGE_KEY) return;
    this.setState({ items: loadCart(getStorage()) });
  }

  commit(items) {
    var clean = sanitizeCartItems(items);
    this.setState({ items: clean });
    saveCart(getStorage(), clean);
    return clean;
  }

  addItem(product, quantity) {
    var result = addItemToCart(this.state.items, product, quantity);
    if (result.error === 'outOfStock' || result.error === 'differentStore' || result.error === 'cartFull') {
      return result;
    }
    this.commit(result.items);
    return result;
  }

  updateQuantity(productId, quantity) {
    var result = updateItemQuantity(this.state.items, productId, quantity);
    if (!result.error || result.error === 'maxStock') {
      this.commit(result.items);
    }
    return result;
  }

  removeItem(productId) {
    this.commit(removeItemFromCart(this.state.items, productId));
  }

  replaceItems(items) {
    return this.commit(items);
  }

  clear() {
    this.setState({ items: [] });
    try {
      var storage = getStorage();
      if (storage) storage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      // Ignore unavailable storage.
    }
  }

  getValue() {
    var items = this.state.items;
    return {
      items: items,
      itemCount: cartItemCount(items),
      lineCount: items.length,
      subtotal: cartSubtotal(items),
      hasUnavailableItems: cartHasUnavailableItems(items),
      checkoutItems: cartCheckoutItems(items),
      addItem: this.addItem,
      updateQuantity: this.updateQuantity,
      removeItem: this.removeItem,
      replaceItems: this.replaceItems,
      clear: this.clear,
    };
  }

  render() {
    return React.createElement(
      CartContext.Provider,
      { value: this.getValue() },
      this.props.children,
    );
  }
}

export default CartContext;
