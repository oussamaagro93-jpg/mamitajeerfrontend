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

    if (this.state.notFound) {
      return React.createElement(NotFound);
    }

    return React.createElement('div', { className: 'min-h-screen bg-white' },

      this.state.menuOpen && React.createElement('div', {
        className: 'fixed inset-0 z-50 bg-black/40',
        onClick: function () { this.setState({ menuOpen: false }); }.bind(this),
      }),

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

      React.createElement(StorefrontHeader, {
        onMenuToggle: function () { this.setState({ menuOpen: !this.state.menuOpen }); }.bind(this),
        onSearchToggle: function () { this.setState({ searchOpen: !this.state.searchOpen }); }.bind(this),
        onLogoClick: function () { window.location.href = '/'; },
      }),

      React.createElement('main', { className: 'pb-28' },
        React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-6 space-y-6' },
          React.createElement(ProductCard, { product: product }),

          product && React.createElement(ProductOptions, {
            product: product,
            selectedOptions: this.state.selectedOptions,
            onOptionChange: this.handleOptionChange.bind(this),
          }),

          React.createElement(CustomerInfo, {
            form: this.state.customerForm,
            onChange: this.handleCustomerFormChange.bind(this),
            wilayas: this.state.wilayas,
            communes: this.state.communes,
            onWilayaChange: this.handleWilayaChange.bind(this),
          }),

          product && React.createElement(PriceSection, {
            price: product.price,
            comparePrice: product.comparePrice,
          }),

          React.createElement(QuantitySelector, {
            quantity: this.state.quantity,
            onChange: function (val) { this.setState({ quantity: val }); }.bind(this),
          }),

          React.createElement('div', { className: 'hidden md:block' },
            React.createElement(BuyButton, {
              onClick: this.handleBuyNow.bind(this),
              size: 'large',
            })
          ),

          product && product.description && React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20' },
            React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 mb-3' }, t('storefront.description.title')),
            React.createElement('div', { className: 'text-base text-gray-600 leading-relaxed whitespace-pre-wrap' }, product.description)
          ),

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

          React.createElement(StoreInfo, null)
        )
      ),

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

export default withTranslation()(ProductDetail);
