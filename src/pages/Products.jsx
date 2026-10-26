import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { productAPI } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';
import { formatDzd } from '../utils/money';

class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true, page: 1, search: '', deleteModal: null };
  }

  componentDidMount() {
    this.fetchProducts();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search) {
      this.fetchProducts();
    }
  }

  fetchProducts() {
    var self = this;
    self.setState({ loading: true });
    productAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () {
      self.setState({ loading: false });
    });
  }

  handleDelete(id) {
    var self = this;
    productAPI.delete(id).then(function () {
      self.fetchProducts();
      notify(self.props.t('products.deleted'));
      self.setState({ deleteModal: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var columns = [
      { key: 'image', label: '', render: function (row) {
        var img = row.image || (row.images && row.images.length > 0 ? row.images[0].url : null);
        return img
          ? React.createElement('img', { src: img, alt: row.name, className: 'w-10 h-10 rounded-lg object-cover' })
          : React.createElement('div', { className: 'w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400' }, 'N/A');
      }},
      { key: 'name', label: t('products.columns.product'), sortable: true, render: function (row) {
        return React.createElement(Link, { to: '/admin/products/' + row.id + '/edit', className: 'text-primary-600 hover:text-primary-700 font-medium' }, row.name);
      }},
      { key: 'sku', label: t('products.columns.sku') },
      { key: 'category', label: t('products.columns.category'), render: function (row) { return row.category ? row.category.name : '-'; }},
      { key: 'price', label: t('products.columns.price'), render: function (row) { return formatDzd(row.price); }},
      { key: 'quantity', label: t('products.columns.stock') },
      { key: 'status', label: t('products.columns.status'), render: function (row) {
        return React.createElement('span', { className: 'badge ' + (row.status === 'published' ? 'badge-success' : row.status === 'draft' ? 'badge-warning' : 'badge-danger') }, row.status);
      }},
      { key: 'actions', label: '', render: function (row) {
        var storefrontUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_STOREFRONT_URL) || window.location.origin;
        var productSlug = row.slug || '';
        var publicUrl = storefrontUrl + '/products/' + productSlug;

        return React.createElement('div', { className: 'flex items-center space-x-1' },
          React.createElement(Link, { to: '/admin/products/' + row.id + '/edit', className: 'p-1.5 text-gray-400 hover:text-primary-600 transition-colors', title: t('common.edit') },
            React.createElement(PencilIcon, { className: 'w-4 h-4' })
          ),
          productSlug && React.createElement('button', {
            onClick: function () { window.open(publicUrl, '_blank'); },
            className: 'p-1.5 text-gray-400 hover:text-primary-600 transition-colors',
            title: t('products.preview'),
          },
            React.createElement(EyeIcon, { className: 'w-4 h-4' })
          ),
          productSlug && React.createElement('button', {
            onClick: function () {
              navigator.clipboard.writeText(publicUrl).then(function () {
                notify(t('products.linkCopied'));
              }).catch(function () {
                notify(t('products.copyFailed'), 'error');
              });
            },
            className: 'p-1.5 text-gray-400 hover:text-primary-600 transition-colors',
            title: t('products.copyLink'),
          },
            React.createElement(ClipboardIcon, { className: 'w-4 h-4' })
          ),
          React.createElement('button', { onClick: function () { this.setState({ deleteModal: row }); }.bind(this), className: 'p-1.5 text-gray-400 hover:text-danger-500 transition-colors', title: t('common.delete') },
            React.createElement(TrashIcon, { className: 'w-4 h-4' })
          )
        );
      }.bind(this)},
    ];

    var data = this.state.data;

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('products.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('products.subtitle'))
        ),
        React.createElement(Link, { to: '/admin/products/new', className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }),
          t('products.addProduct')
        )
      ),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('input', { type: 'text', placeholder: t('products.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' })
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.products : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('products.noProductsFound') }),
      React.createElement(Modal, { open: !!this.state.deleteModal, onClose: function () { this.setState({ deleteModal: null }); }.bind(this), title: t('products.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('products.deleteConfirm'),
          React.createElement('strong', null, this.state.deleteModal ? this.state.deleteModal.name : ''),
          t('products.deleteWarning')
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteModal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteModal.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Products);
