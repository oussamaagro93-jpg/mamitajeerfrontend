import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import CartContext from '../context/CartContext';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import CheckoutPanel from '../components/storefront/CheckoutPanel';

class CartCheckoutPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleOrderPlaced = this.handleOrderPlaced.bind(this);
  }

  handleOrderPlaced(order) {
    const total = parseFloat(order.total) || 0;
    const orderNumber = order.orderNumber;

    // The cart is only cleared after the backend has created the order. If the
    // request fails, CheckoutPanel shows the error and the cart stays intact.
    this.context.clear();

    this.props.history.push(
      '/order-success/' + encodeURIComponent(orderNumber) + '?value=' + encodeURIComponent(total.toFixed(2)),
    );
  }

  renderEmpty() {
    const t = this.props.t;
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-purple-200 bg-white/70 p-10 text-center">
        <h1 className="text-xl font-extrabold text-gray-900">{t('cart.emptyTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500">{t('cart.emptyCheckout')}</p>
        <Link to="/categories" className="mt-6 inline-flex rounded-2xl bg-[#6C3DF2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/20">
          {t('cart.browseCategories')}
        </Link>
      </div>
    );
  }

  render() {
    const t = this.props.t;
    const items = this.context ? this.context.checkoutItems : [];
    const allItems = this.context ? this.context.items : [];
    const hasUnavailableItems = this.context ? this.context.hasUnavailableItems : false;

    return (
      <div className="product-page-bg min-h-screen">
        <StorefrontHeader showMenu={false} onSearchToggle={function () {}} onLogoClick={function () { window.location.href = '/'; }} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6">
            <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-purple-700 transition-colors hover:text-purple-900">
              <ChevronLeftIcon className="h-4 w-4" />
              {t('checkout.backToCart')}
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{t('checkout.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">{t('checkout.cartSubtitle')}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                <LockClosedIcon className="h-4 w-4" />
                {t('checkout.secureCheckout')}
              </div>
            </div>
          </div>

          {allItems.length === 0 || items.length === 0 ? this.renderEmpty() : (
            hasUnavailableItems ? (
              <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
                <h2 className="text-lg font-extrabold text-amber-900">{t('cart.unavailable')}</h2>
                <p className="mt-2 text-sm text-amber-800">{t('cart.availabilityError')}</p>
                <Link to="/cart" className="mt-5 inline-flex rounded-2xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg">
                  {t('checkout.backToCart')}
                </Link>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl">
                <CheckoutPanel
                  mode="cart"
                  items={items}
                  onOrderPlaced={this.handleOrderPlaced}
                />
              </div>
            )
          )}
        </main>
      </div>
    );
  }
}

CartCheckoutPage.contextType = CartContext;

export default withTranslation()(CartCheckoutPage);
