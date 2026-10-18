import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { orderAPI } from '../api';
import { TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

var statusColors = {
  pending: 'badge-warning', confirmed: 'badge-warning', processing: 'badge-warning',
  shipped: 'badge-success', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-danger',
};

class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true, page: 1, search: '', status: '', deleteTarget: null };
  }

  componentDidMount() { this.fetchOrders(); }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search || prevState.status !== this.state.status) { this.fetchOrders(); }
  }

  fetchOrders() {
    var self = this;
    self.setState({ loading: true });
    orderAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search, status: self.state.status || undefined }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    orderAPI.delete(id).then(function () {
      self.fetchOrders(); notify(t('orders.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var columns = [
      { key: 'orderNumber', label: t('orders.columns.order'), render: function (row) { return React.createElement(Link, { to: '/admin/orders/' + row.id, className: 'text-primary-600 hover:text-primary-700 font-medium' }, row.orderNumber); }},
      { key: 'email', label: t('orders.columns.customer') },
      { key: 'total', label: t('orders.columns.total'), render: function (row) { return '$' + parseFloat(row.total).toFixed(2); }},
      { key: 'status', label: t('orders.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (statusColors[row.status] || 'badge-warning') }, t('orders.' + row.status)); }},
      { key: 'paymentStatus', label: t('orders.columns.payment'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning') }, t('orders.' + row.paymentStatus)); }},
      { key: 'createdAt', label: t('orders.columns.date'), render: function (row) { return new Date(row.createdAt).toLocaleDateString(); }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('button', { onClick: function () { this.setState({ deleteTarget: row }); }.bind(this), className: 'p-1 text-gray-400 hover:text-danger-500' },
          React.createElement(TrashIcon, { className: 'w-4 h-4' })
        );
      }.bind(this)},
    ];

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('orders.title')),
        React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('orders.subtitle'))
      ),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('input', { type: 'text', placeholder: t('orders.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' }),
        React.createElement('select', { value: this.state.status, onChange: function (e) { this.setState({ status: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-[150px]' },
          React.createElement('option', { value: '' }, t('orders.allStatuses')),
          React.createElement('option', { value: 'pending' }, t('orders.pending')),
          React.createElement('option', { value: 'confirmed' }, t('orders.confirmed')),
          React.createElement('option', { value: 'processing' }, t('orders.processing')),
          React.createElement('option', { value: 'shipped' }, t('orders.shipped')),
          React.createElement('option', { value: 'delivered' }, t('orders.delivered')),
          React.createElement('option', { value: 'cancelled' }, t('orders.cancelled'))
        )
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.orders : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('orders.noOrders') }),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('orders.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('orders.deleteConfirm', { orderNumber: this.state.deleteTarget ? this.state.deleteTarget.orderNumber : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Orders);
