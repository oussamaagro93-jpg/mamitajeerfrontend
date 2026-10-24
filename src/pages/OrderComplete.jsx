import React from 'react';
import { withTranslation } from 'react-i18next';
import { productAPI } from '../api';
import StorefrontHeader from '../components/storefront/StorefrontHeader';

function getQueryParam(search, name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(search || '');
  if (!match) return '';
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch (e) {
    return match[1];
  }
}

class OrderComplete extends React.Component {
  constructor(props) {
    super(props);
    var search = props.location ? props.location.search : '';
    this.state = {
      categoryId: getQueryParam(search, 'categoryId'),
      categoryName: getQueryParam(search, 'categoryName'),
      productId: getQueryParam(search, 'productId'),
      products: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.fetchCategoryProducts();
  }

  fetchCategoryProducts() {
    var self = this;
    var categoryId = this.state.categoryId;

    // Recommendations are scoped to the purchased product's category.
    if (!categoryId) {
      this.setState({ loading: false });
      return;
    }

    productAPI.getAll({ categoryId: categoryId, status: 'published', limit: 12 }).then(function (res) {
      var products = (res.data.data.products || []).filter(function (p) {
        return String(p.id) !== String(self.state.productId);
      }).slice(0, 8);

      self.setState({ products: products, loading: false });
    }).catch(function () {
      self.setState({ loading: false });
    });
  }

  renderProductCard(product) {
    var img = product.image || (product.images && product.images.length > 0 ? product.images[0].url : null);

    return React.createElement('a', {
      key: product.id,
      href: '/products/' + product.slug,
      className: 'group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all',
    },
      React.createElement('div', { className: 'aspect-square bg-gray-50 flex items-center justify-center overflow-hidden' },
        img
          ? React.createElement('img', {
              src: img,
              alt: product.name,
              className: 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
              loading: 'lazy',
            })
          : React.createElement('div', { className: 'w-16 h-16 bg-[#6C3DF2]/10 rounded-full' })
      ),
      React.createElement('div', { className: 'p-3 sm:p-4' },
        React.createElement('h3', { className: 'font-medium text-gray-900 text-sm sm:text-base truncate' }, product.name),
        React.createElement('p', { className: 'text-sm sm:text-base font-bold text-[#6C3DF2] mt-1' },
          parseFloat(product.price).toFixed(2) + ' DA'
        )
      )
    );
  }

  render() {
    var t = this.props.t;
    var state = this.state;

    return React.createElement('div', { className: 'min-h-screen bg-gray-50' },

      React.createElement(StorefrontHeader, {
        onMenuToggle: function () {},
        onSearchToggle: function () {},
        onLogoClick: function () { window.location.href = '/'; },
      }),

      React.createElement('main', { className: 'max-w-5xl mx-auto px-4 py-8' },
        React.createElement('div', { className: 'bg-white rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100' },

          React.createElement('div', { className: 'text-center mb-6' },
            React.createElement('h1', { className: 'text-2xl sm:text-3xl font-bold text-gray-900' }, t('checkout.success.discoverTitle')),
            React.createElement('p', { className: 'text-sm sm:text-base text-gray-500 mt-2' },
              state.categoryName
                ? t('checkout.success.discoverCategory', { category: state.categoryName })
                : t('checkout.success.discoverSubtitle')
            )
          ),

          state.loading
            ? React.createElement('div', { className: 'flex items-center justify-center py-16' },
                React.createElement('div', { className: 'animate-spin rounded-full h-10 w-10 border-4 border-[#6C3DF2] border-t-transparent' })
              )
            : state.products.length > 0
              ? React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' },
                  state.products.map(function (product) {
                    return this.renderProductCard(product);
                  }.bind(this))
                )
              : React.createElement('p', { className: 'text-center text-gray-500 py-12' }, t('checkout.success.noMoreProducts'))
        )
      )
    );
  }
}

export default withTranslation()(OrderComplete);
