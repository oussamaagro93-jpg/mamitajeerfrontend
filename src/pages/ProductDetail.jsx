import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../api';
import MetaPixel from '../utils/pixel';
import { getWhatsappNumber } from '../utils/storeContacts';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import ProductCard from '../components/storefront/ProductCard';
import ProductTile from '../components/storefront/ProductTile';
import AddToCartButton from '../components/storefront/AddToCartButton';
import ProductOptions from '../components/storefront/ProductOptions';
import PriceSection from '../components/storefront/PriceSection';
import QuantitySelector from '../components/storefront/QuantitySelector';
import CheckoutPanel from '../components/storefront/CheckoutPanel';
import StickyBottomBar from '../components/storefront/StickyBottomBar';
import StoreInfo from '../components/storefront/StoreInfo';
import NotFound from './NotFound';

class ProductDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      relatedProducts: [],
      loading: true,
      notFound: false,
      quantity: 1,
      selectedOptions: {},
      searchOpen: false,
    };
    this.submitOrder = null;
  }

  componentDidMount() {
    this.fetchProduct();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.slug !== this.props.match.params.slug) {
      this.setState({ loading: true, notFound: false, product: null, quantity: 1, selectedOptions: {} });
      this.fetchProduct();
    }
  }

  updateMeta(product) {
    var t = this.props.t;
    var title = product.name + ' - ' + t('app.name');
    var description = product.shortDescription || product.description || '';

    document.title = title;

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description.substring(0, 200));

    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', window.location.href);

    var metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description.substring(0, 200));
  }

  fetchProduct() {
    var slug = this.props.match.params.slug;
    var self = this;

    productAPI.getBySlug(slug).then(function (res) {
      var product = res.data.data.product;
      self.updateMeta(product);
      self.setState({
        product: product,
        relatedProducts: product.relatedProducts || [],
        loading: false,
      }, function () {
        MetaPixel.viewContent({
          content_name: product.name,
          content_category: product.category ? product.category.name : '',
          content_ids: [String(product.id)],
          content_type: 'product',
          contents: [{ id: String(product.id), quantity: 1, item_price: parseFloat(product.price) }],
          currency: 'DZD',
          value: parseFloat(product.price),
        });
      });
    }).catch(function () {
      document.title = self.props.t('errors.notFound.title') + ' - ' + self.props.t('app.name');
      self.setState({ notFound: true, loading: false });
    });
  }

  handleOptionChange(key, value) {
    this.setState({ selectedOptions: Object.assign({}, this.state.selectedOptions, { [key]: value }) });
  }

  registerSubmit(submit) {
    this.submitOrder = submit;
  }

  handleBuyNow() {
    var panel = document.getElementById('product-checkout');
    if (panel && panel.scrollIntoView) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (this.submitOrder) this.submitOrder();
  }

  handleOrderPlaced(order) {
    var product = this.state.product;
    var orderTotal = parseFloat(order.total) || 0;
    var query = [];

    if (product.categoryId) query.push('categoryId=' + encodeURIComponent(product.categoryId));
    if (product.category && product.category.name) {
      query.push('categoryName=' + encodeURIComponent(product.category.name));
    }
    query.push('productId=' + encodeURIComponent(product.id));
    query.push('value=' + encodeURIComponent(orderTotal.toFixed(2)));

    this.props.history.push('/order-success/' + encodeURIComponent(order.orderNumber) + '?' + query.join('&'));
  }

  render() {
    var t = this.props.t;
    var product = this.state.product;
    var related = this.state.relatedProducts;
    var store = product && product.store;
    var whatsappNumber = getWhatsappNumber(store);

    if (this.state.loading) {
      return React.createElement('div', { className: 'product-page-bg min-h-screen' },
        React.createElement(StorefrontHeader, {
          showMenu: false,
          onSearchToggle: function () {},
        }),
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12' },
          React.createElement('div', { className: 'product-surface overflow-hidden animate-pulse', 'aria-busy': 'true' },
            React.createElement('div', { className: 'grid md:grid-cols-2' },
              React.createElement('div', { className: 'aspect-square bg-purple-50/70' }),
              React.createElement('div', { className: 'p-6 sm:p-8 lg:p-10 space-y-4' },
                React.createElement('div', { className: 'h-5 w-28 rounded-full bg-purple-100' }),
                React.createElement('div', { className: 'h-9 w-3/4 rounded-xl bg-gray-100' }),
                React.createElement('div', { className: 'h-4 w-full rounded-lg bg-gray-100' }),
                React.createElement('div', { className: 'h-4 w-5/6 rounded-lg bg-gray-100' }),
                React.createElement('div', { className: 'h-4 w-2/3 rounded-lg bg-gray-100' })
              )
            )
          ),
          React.createElement('div', { className: 'mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6' },
            React.createElement('div', { className: 'product-surface h-56 lg:col-span-7 xl:col-span-8 animate-pulse bg-purple-50/40' }),
            React.createElement('div', { className: 'product-surface h-96 lg:col-span-5 xl:col-span-4 animate-pulse bg-purple-50/40' })
          )
        )
      );
    }

    if (this.state.notFound) {
      return React.createElement(NotFound);
    }

    return React.createElement('div', { className: 'product-page-bg min-h-screen' },

      this.state.searchOpen && React.createElement('div', {
        className: 'fixed inset-0 z-[60] bg-gray-950/50 backdrop-blur-sm px-4 pt-24',
        onClick: function () { this.setState({ searchOpen: false }); }.bind(this),
      },
        React.createElement('div', {
          className: 'mx-auto w-full max-w-xl rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-purple-100',
          onClick: function (e) { e.stopPropagation(); },
        },
          React.createElement('div', { className: 'flex items-center gap-2 px-3' },
            React.createElement(MagnifyingGlassIcon, { className: 'w-5 h-5 text-purple-500 flex-shrink-0' }),
            React.createElement('input', {
              type: 'text',
              placeholder: t('storefront.search.placeholder'),
              className: 'w-full bg-transparent px-2 py-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none',
              autoFocus: true,
            })
          )
        )
      ),

      React.createElement(StorefrontHeader, {
        showMenu: false,
        onSearchToggle: function () { this.setState({ searchOpen: !this.state.searchOpen }); }.bind(this),
        onLogoClick: function () { window.location.href = '/'; },
      }),

      React.createElement('main', { className: 'relative pb-28' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10' },

          React.createElement('div', { className: 'product-reveal' },
            React.createElement(ProductCard, { product: product })
          ),

          React.createElement('div', { className: 'mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start' },

            // Purchase controls
            React.createElement('div', { className: 'space-y-5 sm:space-y-6 lg:col-span-7 xl:col-span-8 lg:col-start-1 lg:row-start-1 product-reveal product-reveal-delay-1' },
              product && React.createElement(ProductOptions, {
                product: product,
                selectedOptions: this.state.selectedOptions,
                onOptionChange: this.handleOptionChange.bind(this),
              }),

              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6' },
                product && React.createElement(PriceSection, {
                  price: product.price,
                  comparePrice: product.comparePrice,
                }),

                React.createElement(QuantitySelector, {
                  quantity: this.state.quantity,
                  max: product.quantity,
                  onChange: function (val) {
                    var max = parseInt(product.quantity, 10);
                    var next = parseInt(val, 10) || 1;
                    if (Number.isInteger(max) && max > 0 && next > max) next = max;
                    this.setState({ quantity: Math.max(1, next) });
                  }.bind(this),
                })
              ),

              product && React.createElement('div', { className: 'product-surface p-5 sm:p-6' },
                React.createElement('p', { className: 'mb-3 text-sm text-gray-500' }, t('cart.addToCartHint')),
                React.createElement(AddToCartButton, {
                  product: product,
                  quantity: this.state.quantity,
                })
              )
            ),

            // Checkout column (appears right after the purchase controls on mobile)
            React.createElement('div', { className: 'lg:col-span-5 xl:col-span-4 lg:col-start-8 xl:col-start-9 lg:row-start-1 lg:row-span-2 product-reveal product-reveal-delay-2' },
              product && React.createElement(CheckoutPanel, {
                product: product,
                quantity: this.state.quantity,
                onRegisterSubmit: this.registerSubmit.bind(this),
                onOrderPlaced: this.handleOrderPlaced.bind(this),
              })
            ),

            // Product details and store information
            React.createElement('div', { className: 'space-y-5 sm:space-y-6 lg:col-span-7 xl:col-span-8 lg:col-start-1 lg:row-start-2 product-reveal product-reveal-delay-2' },

              product && product.description && React.createElement('div', { className: 'product-surface p-5 sm:p-6 lg:p-8' },
                React.createElement('div', { className: 'mb-3 flex items-center gap-3' },
                  React.createElement('span', { className: 'h-6 w-1.5 rounded-full bg-gradient-to-b from-[#5B21B6] to-[#6C3DF2]' }),
                  React.createElement('h2', { className: 'text-lg sm:text-xl font-bold tracking-tight text-gray-900' }, t('storefront.description.title'))
                ),
                React.createElement('div', { className: 'text-sm sm:text-base text-gray-600 leading-7 whitespace-pre-wrap' }, product.description)
              ),

              product && React.createElement(StoreInfo, { store: product.store })
            )
          ),

          related.length > 0 && React.createElement('section', { className: 'mt-10 lg:mt-14 product-reveal product-reveal-delay-3' },
            React.createElement('div', { className: 'mb-5 flex flex-wrap items-center justify-between gap-3' },
              React.createElement('div', { className: 'flex items-center gap-3' },
                React.createElement('span', { className: 'h-7 w-1.5 rounded-full bg-gradient-to-b from-[#5B21B6] to-[#6C3DF2]' }),
                React.createElement('div', null,
                  React.createElement('h2', { className: 'text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900' }, t('storefront.relatedProducts.title')),
                  product.category && product.category.name
                    ? React.createElement('p', { className: 'mt-1 text-sm text-gray-500' },
                        t('storefront.relatedProducts.sameCategory', { category: product.category.name }))
                    : null
                )
              ),
              product.categoryId
                ? React.createElement(Link, {
                    to: '/categories/' + product.categoryId,
                    className: 'inline-flex items-center rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:border-purple-300 hover:bg-purple-50',
                  }, t('storefront.relatedProducts.seeAll'))
                : null
            ),
            React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5' },
              related.map(function (rp) {
                return React.createElement(ProductTile, {
                  key: rp.id,
                  product: rp,
                  showCategory: false,
                });
              })
            )
          )
        )
      ),

      React.createElement('div', { className: 'md:hidden' },
        React.createElement(StickyBottomBar, {
          onBuyClick: this.handleBuyNow.bind(this),
          onChatClick: function () { alert(t('storefront.chat.placeholder')); },
          onWhatsAppClick: whatsappNumber
            ? function () { window.open('https://wa.me/' + whatsappNumber.replace(/\D/g, ''), '_blank'); }
            : null,
        })
      )
    );
  }
}

export default withTranslation()(ProductDetail);
