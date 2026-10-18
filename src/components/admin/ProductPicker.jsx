import React from 'react';
import { withTranslation } from 'react-i18next';
import { XMarkIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../../api';

class ProductPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
      results: [],
      allProducts: [],
      loading: false,
      selectedIds: this.props.selectedIds || [],
      loaded: false,
    };
    this.searchTimeout = null;
  }

  componentDidMount() {
    this.loadProducts('');
  }

  loadProducts(search) {
    var self = this;
    this.setState({ loading: true });
    var params = { limit: 200, status: 'published' };
    if (search.trim()) params.search = search.trim();
    productAPI.getAll(params).then(function (res) {
      var products = res.data.data.products || [];
      self.setState({
        results: products,
        allProducts: search ? self.state.allProducts : products,
        loading: false,
        loaded: true,
      });
    }).catch(function () {
      self.setState({ loading: false, loaded: true });
    });
  }

  handleSearch(e) {
    var value = e.target.value;
    this.setState({ search: value });

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (!value.trim()) {
      this.setState({ results: this.state.allProducts });
      return;
    }

    this.setState({ loading: true });
    this.searchTimeout = setTimeout(function () {
      this.loadProducts(value.trim());
    }.bind(this), 400);
  }

  isSelected(id) {
    return this.state.selectedIds.indexOf(id) !== -1;
  }

  toggleProduct(id) {
    this.setState(function (prev) {
      var ids = prev.selectedIds.slice();
      var idx = ids.indexOf(id);
      if (idx === -1) {
        ids.push(id);
      } else {
        ids.splice(idx, 1);
      }
      return { selectedIds: ids };
    });
  }

  handleConfirm() {
    if (this.props.onConfirm) {
      this.props.onConfirm(this.state.selectedIds);
    }
  }

  render() {
    var t = this.props.t;
    var open = this.props.open;
    var onClose = this.props.onClose || function () {};

    if (!open) return null;

    var selectedCount = this.state.selectedIds.length;

    return React.createElement('div', { className: 'fixed inset-0 z-50 overflow-y-auto' },
      React.createElement('div', { className: 'fixed inset-0 bg-black/40', onClick: onClose }),
      React.createElement('div', { className: 'flex min-h-full items-start justify-center p-4 pt-12' },
        React.createElement('div', { className: 'card w-full max-w-2xl relative' },
          // Header
          React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, t('products.selectRelatedProducts')),
            React.createElement('button', { onClick: onClose, className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' },
              React.createElement(XMarkIcon, { className: 'w-5 h-5' })
            )
          ),

          // Search
          React.createElement('div', { className: 'px-6 py-3 border-b border-gray-100 dark:border-gray-800' },
            React.createElement('div', { className: 'relative' },
              React.createElement(MagnifyingGlassIcon, { className: 'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' }),
              React.createElement('input', {
                type: 'text',
                value: this.state.search,
                onChange: this.handleSearch.bind(this),
                placeholder: t('products.searchProducts'),
                className: 'w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                autoFocus: true,
              })
            )
          ),

          // Results
          React.createElement('div', { className: 'px-6 py-3 max-h-80 overflow-y-auto' },
            this.state.loading && React.createElement('div', { className: 'flex items-center justify-center py-8' },
              React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent' })
            ),

            !this.state.loading && this.state.loaded && this.state.results.length === 0 && React.createElement('p', { className: 'text-center text-gray-500 dark:text-gray-400 py-8 text-sm' },
              t('products.noProductsFound')
            ),

            !this.state.loading && this.state.results.length > 0 && React.createElement('div', { className: 'space-y-1' },
              this.state.results.map(function (p) {
                var selected = this.isSelected(p.id);
                var img = p.image || (p.images && p.images.length > 0 ? p.images[0].url : null);
                return React.createElement('button', {
                  key: p.id,
                  onClick: this.toggleProduct.bind(this, p.id),
                  className: 'w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ' +
                    (selected ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'),
                },
                  React.createElement('div', { className: 'w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden' },
                    img
                      ? React.createElement('img', { src: img, alt: p.name, className: 'w-full h-full object-cover' })
                      : React.createElement('div', { className: 'w-full h-full flex items-center justify-center' },
                          React.createElement(ShoppingBagIcon, { className: 'w-5 h-5 text-gray-400' })
                        )
                  ),
                  React.createElement('div', { className: 'flex-1 min-w-0 text-left' },
                    React.createElement('p', { className: 'text-sm font-medium text-gray-900 dark:text-white truncate' }, p.name),
                    React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400' }, parseFloat(p.price).toFixed(2) + ' DA')
                  ),
                  React.createElement('div', {
                    className: 'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ' +
                      (selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600'),
                  },
                    selected && React.createElement('svg', { className: 'w-3 h-3 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 3 },
                      React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M5 13l4 4L19 7' })
                    )
                  )
                );
              }.bind(this))
            )

          ),

          // Footer
          React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700' },
            React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' },
              selectedCount > 0 ? selectedCount + ' ' + t('products.selected') : t('products.noProductsSelected')
            ),
            React.createElement('div', { className: 'flex space-x-2' },
              React.createElement('button', { onClick: onClose, className: 'btn-secondary text-sm' }, t('common.cancel')),
              React.createElement('button', {
                onClick: this.handleConfirm.bind(this),
                disabled: selectedCount === 0,
                className: 'btn-primary text-sm',
              }, t('products.addRelated'))
            )
          )
        )
      )
    );
  }
}

export default withTranslation()(ProductPicker);
