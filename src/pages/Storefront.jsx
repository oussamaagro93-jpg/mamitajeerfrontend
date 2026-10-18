import React from 'react';
import { withTranslation } from 'react-i18next';
import { productAPI } from '../api';
import { publicShippingAPI } from '../api/shipping';
import MetaPixel from '../utils/pixel';
import { LANGUAGES, languageSlice } from '../store/languageSlice';
import { store } from '../store';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import ProductCard from '../components/storefront/ProductCard';
import ProductOptions from '../components/storefront/ProductOptions';
import CustomerInfo from '../components/storefront/CustomerInfo';
import PriceSection from '../components/storefront/PriceSection';
import QuantitySelector from '../components/storefront/QuantitySelector';
import BuyButton from '../components/storefront/BuyButton';
import StickyBottomBar from '../components/storefront/StickyBottomBar';
import StoreInfo from '../components/storefront/StoreInfo';

class Storefront extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      relatedProducts: [],
      loading: true,
      quantity: 1,
      selectedOptions: {},
      customerForm: { country: '', state: '', city: '', address: '', note: '', wilayaId: '', guestWilaya: '', communeId: '' },
      wilayas: [],
      communes: [],
      menuOpen: false,
      searchOpen: false,
    };
  }

  componentDidMount() {
    this.fetchProduct();
    var self = this;
    publicShippingAPI.getWilayas().then(function (res) {
      self.setState({ wilayas: res.data.data.wilayas || [] });
    }).catch(function () {});
  }

  fetchProduct() {
    var self = this;
    // Fetch featured product first, fall back to first published product
    productAPI.getAll({ isFeatured: true, status: 'published', limit: 5 })
      .then(function (res) {
        var products = res.data.data.products || [];
        if (products.length > 0) {
          // Load full product details for the first product
          self.loadFullProduct(products[0].id, products.slice(1));
        } else {
          // Fallback: get any published product
          return productAPI.getAll({ status: 'published', limit: 5 });
        }
      })
      .catch(function () {
        // Fallback on error
        return productAPI.getAll({ status: 'published', limit: 5 });
      })
      .then(function (res) {
        if (res && res.data && res.data.data) {
          var products = res.data.data.products || [];
          if (products.length > 0 && !self.state.product) {
            self.loadFullProduct(products[0].id, products.slice(1));
          }
        }
      })
      .catch(function () {
        self.setState({ loading: false });
      });
  }

  loadFullProduct(id, related) {
    var self = this;
    productAPI.getById(id).then(function (res) {
      var product = res.data.data.product;
      self.setState({
        product: product,
        relatedProducts: product.relatedProducts || related || [],
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
      self.setState({ loading: false });
    });
  }

  handleOptionChange(key, value) {
    this.setState({ selectedOptions: Object.assign({}, this.state.selectedOptions, { [key]: value }) });
  }

  handleCustomerFormChange(key, value) {
    if (typeof key === 'object') {
      this.setState({ customerForm: Object.assign({}, this.state.customerForm, key) });
    } else {
      this.setState({ customerForm: Object.assign({}, this.state.customerForm, { [key]: value }) });
    }
  }

  handleWilayaChange(wilayaId) {
    var self = this;
    this.setState({ communes: [] });
    if (wilayaId) {
      publicShippingAPI.getCommunes(wilayaId).then(function (res) {
        self.setState({ communes: res.data.data.communes || [] });
      }).catch(function () {});
    }
  }

  handleBuyNow() {
    var product = this.state.product;
    var quantity = this.state.quantity;

    MetaPixel.addToCart({
      content_ids: [String(product.id)],
      content_type: 'product',
      contents: [{ id: String(product.id), quantity: quantity, item_price: parseFloat(product.price) }],
      currency: 'DZD',
      value: parseFloat(product.price) * quantity,
    });

    var checkoutData = JSON.stringify({
      slug: product.slug,
      quantity: quantity,
      customerForm: this.state.customerForm,
      selectedOptions: this.state.selectedOptions,
    });
    try { sessionStorage.setItem('checkoutItem', checkoutData); } catch (e) {}

    this.props.history.push('/checkout');
  }

  render() {
    var t = this.props.t;
    var product = this.state.product;
    var related = this.state.relatedProducts;

    if (this.state.loading) {
      return React.createElement('div', { className: 'min-h-screen bg-white' },
        React.createElement(StorefrontHeader, {
          onMenuToggle: function () {},
          onSearchToggle: function () {},
        }),
        React.createElement('div', { className: 'flex items-center justify-center min-h-[60vh]' },
          React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-4 border-[#6C3DF2] border-t-transparent' })
        )
      );
    }

    return React.createElement('div', { className: 'min-h-screen bg-white' },

      // Navigation Drawer Overlay
      this.state.menuOpen && React.createElement('div', {
        className: 'fixed inset-0 z-50 bg-black/40',
        onClick: function () { this.setState({ menuOpen: false }); }.bind(this),
      }),

      // Navigation Drawer
      React.createElement('div', {
        className: 'fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ' +
          (this.state.menuOpen ? 'translate-x-0' : '-translate-x-full'),
      },
        React.createElement('div', { className: 'p-6' },
          React.createElement('div', { className: 'flex items-center justify-between mb-8' },
            React.createElement('div', { className: 'flex items-center space-x-2' },
              React.createElement('div', { className: 'w-9 h-9 bg-[#6C3DF2] rounded-xl flex items-center justify-center' },
                React.createElement('span', { className: 'text-sm font-bold text-white' }, t('app.logo'))
              ),
              React.createElement('span', { className: 'text-lg font-bold text-gray-900' }, t('app.name'))
            ),
            React.createElement('button', {
              onClick: function () { this.setState({ menuOpen: false }); }.bind(this),
              className: 'p-1 text-gray-400 hover:text-gray-600',
            },
              React.createElement('span', { className: 'text-2xl' }, '\u00D7')
            )
          ),
          React.createElement('nav', { className: 'space-y-2' },
            React.createElement('a', { href: '/', className: 'block px-4 py-3 rounded-xl bg-[#6C3DF2]/10 text-[#6C3DF2] font-medium' }, t('nav.home')),
            React.createElement('a', { href: '/login', className: 'block px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors' }, t('auth.signIn')),
            React.createElement('a', { href: '/register', className: 'block px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors' }, t('auth.signUp')),
            React.createElement('hr', { className: 'border-gray-200 my-2' }),
            React.createElement('p', { className: 'px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider' }, t('storefront.header.language')),
            LANGUAGES.map(function (lang) {
              return React.createElement('button', {
                key: lang.code,
                onClick: function () {
                  store.dispatch(languageSlice.setLanguage(lang.code));
                  this.setState({ menuOpen: false });
                }.bind(this),
                className: 'block w-full text-left px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors',
              }, lang.label);
            }.bind(this))
          )
        )
      ),

      // Search Overlay
      this.state.searchOpen && React.createElement('div', {
        className: 'fixed inset-0 z-50 bg-black/40',
        onClick: function () { this.setState({ searchOpen: false }); }.bind(this),
      },
        React.createElement('div', {
          className: 'bg-white mx-4 mt-20 rounded-2xl p-4 shadow-2xl max-w-lg mx-auto',
          onClick: function (e) { e.stopPropagation(); },
        },
          React.createElement('input', {
            type: 'text',
            placeholder: t('storefront.search.placeholder'),
            className: 'w-full px-4 py-3 border-2 border-[#6C3DF2]/30 rounded-xl text-base focus:outline-none focus:border-[#6C3DF2]',
            autoFocus: true,
          })
        )
      ),

      // Header
      React.createElement(StorefrontHeader, {
        onMenuToggle: function () { this.setState({ menuOpen: !this.state.menuOpen }); }.bind(this),
        onSearchToggle: function () { this.setState({ searchOpen: !this.state.searchOpen }); }.bind(this),
        onLogoClick: function () { window.location.href = '/'; },
      }),

      // Main Content
      React.createElement('main', { className: 'pb-28' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-6 space-y-6' },

          // Product Card
          React.createElement(ProductCard, { product: product }),

          // Product Options
          product && React.createElement(ProductOptions, {
            product: product,
            selectedOptions: this.state.selectedOptions,
            onOptionChange: this.handleOptionChange.bind(this),
          }),

          // Customer Info
          React.createElement(CustomerInfo, {
            form: this.state.customerForm,
            onChange: this.handleCustomerFormChange.bind(this),
            wilayas: this.state.wilayas,
            communes: this.state.communes,
            onWilayaChange: this.handleWilayaChange.bind(this),
          }),

          // Price
          product && React.createElement(PriceSection, {
            price: product.price,
            comparePrice: product.comparePrice,
          }),

          // Quantity
          React.createElement(QuantitySelector, {
            quantity: this.state.quantity,
            onChange: function (val) { this.setState({ quantity: val }); }.bind(this),
          }),

          // Buy Button (desktop, hidden on mobile where sticky bar shows)
          React.createElement('div', { className: 'hidden md:block' },
            React.createElement(BuyButton, {
              onClick: this.handleBuyNow.bind(this),
              size: 'large',
            })
          ),

          // Full Description
          product && product.description && React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20' },
            React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-3' }, t('storefront.description.title')),
            React.createElement('div', { className: 'text-base text-gray-600 leading-relaxed whitespace-pre-wrap' }, product.description)
          ),

          // Related Products
          related.length > 0 && React.createElement('div', null,
            React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-4' }, t('storefront.relatedProducts.title')),
            React.createElement('div', { className: 'flex space-x-4 overflow-x-auto scrollbar-hide pb-2' },
              related.map(function (rp) {
                var img = rp.image || (rp.images && rp.images.length > 0 ? rp.images[0].url : null);
                return React.createElement('a', {
                  key: rp.id,
                  href: '/products/' + rp.slug,
                  className: 'flex-shrink-0 w-44 bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow block',
                },
                  React.createElement('div', { className: 'aspect-square bg-gray-50 flex items-center justify-center' },
                    img
                      ? React.createElement('img', { src: img, alt: rp.name, className: 'w-full h-full object-cover' })
                      : React.createElement('div', { className: 'w-12 h-12 bg-gray-200 rounded-full' })
                  ),
                  React.createElement('div', { className: 'p-3' },
                    React.createElement('h3', { className: 'font-medium text-gray-900 text-sm truncate' }, rp.name),
                    React.createElement('p', { className: 'text-sm font-bold text-[#6C3DF2] mt-1' },
                      parseFloat(rp.price).toFixed(2) + ' DA'
                    )
                  )
                );
              })
            )
          ),

          // Store Info
          React.createElement(StoreInfo, null)
        )
      ),

      // Sticky Bottom Bar (mobile only)
      React.createElement('div', { className: 'md:hidden' },
        React.createElement(StickyBottomBar, {
          onBuyClick: this.handleBuyNow.bind(this),
          onChatClick: function () { alert(t('storefront.chat.placeholder')); },
          onWhatsAppClick: function () { window.open('https://wa.me/' + t('storefront.store.phone').replace(/\s/g, ''), '_blank'); },
        })
      )
    );
  }
}

export default withTranslation()(Storefront);
