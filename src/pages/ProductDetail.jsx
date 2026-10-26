import React from 'react';
import { withTranslation } from 'react-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../api';
import MetaPixel from '../utils/pixel';
import { getWhatsappNumber } from '../utils/storeContacts';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import ProductCard from '../components/storefront/ProductCard';
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
      this.setState({ loading: true, notFound: false, product: null });
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
                  onChange: function (val) { this.setState({ quantity: val }); }.bind(this),
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
            React.createElement('div', { className: 'mb-5 flex items-center gap-3' },
              React.createElement('span', { className: 'h-7 w-1.5 rounded-full bg-gradient-to-b from-[#5B21B6] to-[#6C3DF2]' }),
              React.createElement('h2', { className: 'text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900' }, t('storefront.relatedProducts.title'))
            ),
            React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5' },
              related.map(function (rp) {
                var img = rp.image || (rp.images && rp.images.length > 0 ? rp.images[0].url : null);
                return React.createElement('a', {
                  key: rp.id,
                  href: '/products/' + rp.slug,
                  className: 'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-purple-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                },
                  React.createElement('div', { className: 'relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50' },
                    img
                      ? React.createElement('img', {
                          src: img,
                          alt: rp.name,
                          className: 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
                          loading: 'lazy',
                        })
                      : React.createElement('div', { className: 'flex h-full w-full items-center justify-center' },
                          React.createElement('div', { className: 'w-12 h-12 bg-purple-100 rounded-full' })
                        )
                  ),
                  React.createElement('div', { className: 'flex flex-1 flex-col gap-1 p-3 sm:p-4' },
                    React.createElement('h3', { className: 'truncate text-sm font-semibold text-gray-900' }, rp.name),
                    React.createElement('p', { className: 'text-sm font-bold text-purple-700' },
                      parseFloat(rp.price).toFixed(2) + ' DA'
                    )
                  )
                );
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
