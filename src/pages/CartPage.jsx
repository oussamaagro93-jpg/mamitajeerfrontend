import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { productAPI } from '../api';
import CartContext from '../context/CartContext';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import { notify } from '../components/common/Toast';
import { cartItemCount, cartSubtotal, sanitizeCartItems } from '../utils/cart';

class CartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { refreshing: true };
    this.refreshAvailability = this.refreshAvailability.bind(this);
  }

  componentDidMount() {
    this.refreshAvailability();
  }

  refreshAvailability() {
    const self = this;
    const items = this.context ? this.context.items : [];
    if (!items.length) {
      this.setState({ refreshing: false });
      return;
    }

    this.setState({ refreshing: true });
    const beforeSignature = items.map(function (item) {
      return item.productId + ':' + item.quantity;
    }).join('|');
    const ids = items.map(function (item) { return item.productId; }).filter(Boolean);

    productAPI.getAll({ ids: ids.join(','), limit: 500 })
      .then(function (res) {
        const currentItems = self.context ? self.context.items : [];
        const currentSignature = currentItems.map(function (item) {
          return item.productId + ':' + item.quantity;
        }).join('|');
        if (beforeSignature !== currentSignature) {
          // The customer changed the cart while availability was loading; keep
          // their latest edits instead of overwriting them with stale data.
          self.setState({ refreshing: false });
          return;
        }

        const products = res.data.data.products || [];
        const productMap = {};
        products.forEach(function (product) { productMap[product.id] = product; });

        const updated = items.map(function (item) {
          const product = productMap[item.productId];
          if (!product) {
            return { ...item, available: false, stock: 0 };
          }
          const stock = parseInt(product.quantity, 10);
          const available = Number.isInteger(stock) ? stock > 0 : true;
          const maxQuantity = Number.isInteger(stock) && stock > 0 ? stock : item.quantity;
          return {
            ...item,
            name: product.name || item.name,
            slug: product.slug || item.slug,
            price: parseFloat(product.price) || item.price,
            comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : item.comparePrice,
            image: product.image || (product.images && product.images.length > 0 ? product.images[0].url : item.image),
            stock: Number.isInteger(stock) ? stock : null,
            quantity: Math.min(item.quantity, maxQuantity),
            categoryId: product.categoryId || item.categoryId,
            categoryName: (product.category && product.category.name) || item.categoryName,
            adminId: product.adminId || item.adminId,
            deliveryCompanyId: product.deliveryCompanyId || item.deliveryCompanyId,
            available: available,
          };
        });
        self.context.replaceItems(sanitizeCartItems(updated));
        self.setState({ refreshing: false });
      })
      .catch(function () {
        self.setState({ refreshing: false });
      });
  }

  handleQuantityChange(productId, nextQuantity) {
    const result = this.context.updateQuantity(productId, nextQuantity);
    if (result.error === 'maxStock') {
      notify(this.props.t('cart.errors.maxStock', { count: this._stockFor(productId) }), 'error');
    } else if (result.error) {
      notify(this.props.t('cart.errors.' + result.error), 'error');
    }
  }

  _stockFor(productId) {
    const item = this.context.items.find(function (entry) {
      return String(entry.productId) === String(productId);
    });
    return item && Number.isInteger(item.stock) ? item.stock : '';
  }

  handleRemove(productId) {
    this.context.removeItem(productId);
    notify(this.props.t('cart.removed'));
  }

  renderItem(item) {
    const t = this.props.t;
    const unavailable = item.available === false;
    const stock = Number.isInteger(item.stock) ? item.stock : null;
    const lineTotal = (parseFloat(item.price) || 0) * item.quantity;

    return (
      <article
        key={item.productId}
        className={
          'flex gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 transition-all sm:gap-4 sm:p-4 ' +
          (unavailable ? 'ring-red-200' : 'ring-purple-100/80')
        }
      >
        <Link to={'/products/' + item.slug} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-purple-50 ring-1 ring-purple-100 sm:h-28 sm:w-28">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBagIcon className="h-8 w-8 text-purple-200" />
            </div>
          )}
          {unavailable && (
            <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-white">
              {t('cart.unavailable')}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={'/products/' + item.slug} className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors hover:text-purple-700 sm:text-base">
                {item.name}
              </Link>
              {item.categoryName && (
                <p className="mt-1 text-xs text-gray-400">{item.categoryName}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-purple-700">
                {(parseFloat(item.price) || 0).toFixed(2)} DA
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleRemove.bind(this, item.productId)}
              className="flex-shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={t('cart.remove')}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div className="flex items-center gap-1.5 rounded-xl bg-purple-50/80 p-1 ring-1 ring-purple-100/80">
              <button
                type="button"
                onClick={this.handleQuantityChange.bind(this, item.productId, item.quantity - 1)}
                disabled={unavailable || item.quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-purple-700 shadow-sm transition-all hover:bg-purple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-purple-700"
                aria-label={t('cart.decrease')}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-gray-900">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={this.handleQuantityChange.bind(this, item.productId, item.quantity + 1)}
                disabled={unavailable || (stock !== null && item.quantity >= stock)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-purple-700 shadow-sm transition-all hover:bg-purple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-purple-700"
                aria-label={t('cart.increase')}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{t('cart.subtotal')}</p>
              <p className="text-base font-extrabold text-gray-900 sm:text-lg">{lineTotal.toFixed(2)} DA</p>
            </div>
          </div>

          {!unavailable && stock !== null && stock > 0 && stock <= 5 && (
            <p className="mt-2 text-xs font-medium text-amber-600">{t('cart.onlyXLeft', { count: stock })}</p>
          )}
          {unavailable && (
            <p className="mt-2 text-xs font-semibold text-red-600">{t('cart.unavailableHint')}</p>
          )}
        </div>
      </article>
    );
  }

  renderEmpty() {
    const t = this.props.t;
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-purple-200 bg-white/70 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-purple-500">
          <ShoppingBagIcon className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold text-gray-900 sm:text-2xl">{t('cart.emptyTitle')}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{t('cart.emptyMessage')}</p>
        <Link
          to="/categories"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-xl"
        >
          {t('cart.browseCategories')}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  render() {
    const t = this.props.t;
    const items = this.context ? this.context.items : [];
    const unavailable = this.context ? this.context.hasUnavailableItems : false;
    const count = cartItemCount(items);
    const subtotal = cartSubtotal(items);
    const refreshing = this.state.refreshing;

    return (
      <div className="product-page-bg min-h-screen">
        <StorefrontHeader showMenu={false} onSearchToggle={function () {}} onLogoClick={function () { window.location.href = '/'; }} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{t('cart.title')}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {items.length > 0 ? t('cart.itemsInCart', { count: count }) : t('cart.emptyTitle')}
              </p>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:border-purple-300 hover:bg-purple-50"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>

          {items.length === 0 ? this.renderEmpty() : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
              <section className="space-y-3 lg:col-span-8">
                {refreshing && (
                  <div className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3 text-sm font-medium text-purple-700">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                    {t('cart.refreshing')}
                  </div>
                )}
                {unavailable && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <p>{t('cart.availabilityError')}</p>
                  </div>
                )}
                {items.map(function (item) {
                  return this.renderItem(item);
                }.bind(this))}
              </section>

              <aside className="lg:sticky lg:top-24 lg:col-span-4">
                <div className="product-surface p-5 sm:p-6">
                  <h2 className="text-lg font-extrabold tracking-tight text-gray-900">{t('cart.orderSummary')}</h2>
                  <div className="mt-4 space-y-2.5 border-b border-gray-100 pb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('cart.itemsCountLabel')}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('cart.subtotal')}</span>
                      <span className="font-semibold text-gray-900">{subtotal.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('cart.shippingAtCheckout')}</span>
                      <span className="text-xs font-medium text-gray-400">{t('cart.calculatedNext')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-base font-bold text-gray-900">{t('cart.estimatedTotal')}</span>
                    <span className="text-xl font-extrabold text-purple-700">{subtotal.toFixed(2)} DA</span>
                  </div>

                  {unavailable ? (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl bg-gray-200 px-5 py-3.5 text-sm font-bold text-gray-500"
                    >
                      {t('cart.removeUnavailableToContinue')}
                    </button>
                  ) : (
                    <Link
                      to="/checkout"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:shadow-xl hover:shadow-purple-900/30 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {t('cart.checkout')}
                      <ArrowRightIcon className="h-5 w-5" />
                    </Link>
                  )}

                  <p className="mt-3 text-center text-xs text-gray-400">{t('checkout.codInfo')}</p>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    );
  }
}

CartPage.contextType = CartContext;

export default withTranslation()(CartPage);
