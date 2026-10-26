import React from 'react';
import ShopCategories from './ShopCategories';

// The confirmation page now opens the dynamic shop-by-category experience so
// customers can keep browsing products after their order is placed.
class OrderComplete extends React.Component {
  render() {
    return React.createElement(ShopCategories, this.props);
  }
}

export default OrderComplete;
