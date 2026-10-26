import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { orderAPI } from '../api';
import { TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';
import { AuthContext } from '../context/AuthContext';
import { formatDzd } from '../utils/money';

var statusColors = {
  pending: 'badge-warning', confirmed: 'badge-warning', processing: 'badge-warning',
  shipped: 'badge-success', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-danger',
};

var paymentColors = {
  paid: 'badge-success',
  pending: 'badge-warning',
  partially_paid: 'badge-warning',
  refunded: 'badge-danger',
  failed: 'badge-danger',
};

class Orders extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      page: 1,
      search: '',
      searchTerm: '',
      status: '',
      paymentStatus: '',
      deleteTarget: null,
    };
    this.requestId = 0;
    this.mounted = false;
    this.searchTimer = null;
  }

  componentDidMount() {
    this.mounted = true;
    this.fetchOrders();
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.page !== this.state.page ||
      prevState.searchTerm !== this.state.searchTerm ||
      prevState.status !== this.state.status ||
      prevState.paymentStatus !== this.state.paymentStatus
    ) {
      this.fetchOrders();
    }
  }

  handleSearchChange(event) {
    var value = event.target.value;
    var self = this;
    this.setState({ search: value });
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(function () {
      self.setState({ searchTerm: value, page: 1 });
    }, 350);
  }

  fetchOrders() {
    var self = this;
    var requestId = ++this.requestId;
    self.setState({ loading: true });
    orderAPI.getAll({
      page: self.state.page,
      limit: 10,
      search: self.state.searchTerm || undefined,
      status: self.state.status || undefined,
      paymentStatus: self.state.paymentStatus || undefined,
    }).then(function (res) {
      if (!self.mounted || requestId !== self.requestId) return;
      var payload = res.data.data;
      var pagination = payload ? payload.pagination : null;
      var lastPage = pagination ? Math.max(pagination.totalPages, 1) : 1;
      if (pagination && self.state.page > lastPage) {
        self.setState({ page: lastPage, loading: true });
        return;
      }
      self.setState({ data: payload, loading: false });
    }).catch(function (err) {
      if (!self.mounted || requestId !== self.requestId) return;
      var message = (err.response && err.response.data && err.response.data.message) || self.props.t('common.error');
      notify(message, 'error');
      self.setState({ loading: false });
    });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    orderAPI.delete(id).then(function () {
      self.fetchOrders(); notify(t('orders.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var permissions = this.context && this.context.user && Array.isArray(this.context.user.permissions)
      ? this.context.user.permissions
      : [];
    var canDelete = permissions.indexOf('orders.delete') !== -1;

    var columns = [
      { key: 'orderNumber', label: t('orders.columns.order'), render: function (row) { return React.createElement(Link, { to: '/admin/orders/' + row.id, className: 'text-primary-600 hover:text-primary-700 font-medium' }, row.orderNumber); }},
      { key: 'customer', label: t('orders.columns.customer'), render: function (row) {
        var userName = row.user
          ? [row.user.firstName, row.user.lastName].filter(Boolean).join(' ')
          : '';
        var name = row.guestName || userName || row.email || t('orders.na');
        var phone = row.guestPhone || (row.user ? row.user.phone : '');
        return React.createElement('div', null,
          React.createElement('p', { className: 'text-sm text-gray-900 dark:text-white' }, name),
          phone ? React.createElement('p', { className: 'text-xs text-gray-500 dark:text-gray-400' }, phone) : null
        );
      }},
      { key: 'total', label: t('orders.columns.total'), render: function (row) { return formatDzd(row.total); }},
      { key: 'status', label: t('orders.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (statusColors[row.status] || 'badge-warning') }, t('orders.' + row.status)); }},
      { key: 'paymentStatus', label: t('orders.columns.payment'), render: function (row) { return React.createElement('span', { className: 'badge ' + (paymentColors[row.paymentStatus] || 'badge-warning') }, t('orders.' + row.paymentStatus)); }},
      { key: 'createdAt', label: t('orders.columns.date'), render: function (row) { return new Date(row.createdAt).toLocaleDateString(); }},
      { key: 'actions', label: '', render: function (row) {
        if (!canDelete || ['pending', 'cancelled'].indexOf(row.status) === -1) return null;
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
      React.createElement('div', { className: 'flex flex-wrap items-center gap-3' },
        React.createElement('input', { type: 'text', placeholder: t('orders.search'), value: this.state.search, onChange: this.handleSearchChange.bind(this), className: 'input-field max-w-xs' }),
        React.createElement('select', { value: this.state.status, onChange: function (e) { this.setState({ status: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-[150px]' },
          React.createElement('option', { value: '' }, t('orders.allStatuses')),
          React.createElement('option', { value: 'pending' }, t('orders.pending')),
          React.createElement('option', { value: 'confirmed' }, t('orders.confirmed')),
          React.createElement('option', { value: 'processing' }, t('orders.processing')),
          React.createElement('option', { value: 'shipped' }, t('orders.shipped')),
          React.createElement('option', { value: 'delivered' }, t('orders.delivered')),
          React.createElement('option', { value: 'cancelled' }, t('orders.cancelled')),
          React.createElement('option', { value: 'refunded' }, t('orders.refunded'))
        ),
        React.createElement('select', { value: this.state.paymentStatus, onChange: function (e) { this.setState({ paymentStatus: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-[170px]' },
          React.createElement('option', { value: '' }, t('orders.allPaymentStatuses')),
          React.createElement('option', { value: 'pending' }, t('orders.pending')),
          React.createElement('option', { value: 'paid' }, t('orders.paid')),
          React.createElement('option', { value: 'partially_paid' }, t('orders.partially_paid')),
          React.createElement('option', { value: 'refunded' }, t('orders.refunded')),
          React.createElement('option', { value: 'failed' }, t('orders.failed'))
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
