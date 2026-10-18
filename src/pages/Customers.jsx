import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { customerAPI } from '../api';
import { TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class Customers extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, loading: true, page: 1, search: '', deleteTarget: null };
  }

  componentDidMount() { this.fetchCustomers(); }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search) { this.fetchCustomers(); }
  }

  fetchCustomers() {
    var self = this;
    self.setState({ loading: true });
    customerAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    customerAPI.delete(id).then(function () {
      self.fetchCustomers(); notify(t('customers.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var columns = [
      { key: 'name', label: t('customers.columns.name'), render: function (row) { return React.createElement(Link, { to: '/admin/customers/' + row.id, className: 'text-primary-600 hover:text-primary-700 font-medium' }, row.firstName + ' ' + row.lastName); }},
      { key: 'email', label: t('customers.columns.email') },
      { key: 'phone', label: t('customers.columns.phone'), render: function (row) { return row.phone || '-'; }},
      { key: 'isActive', label: t('customers.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('customers.active') : t('customers.inactive')); }},
      { key: 'createdAt', label: t('customers.columns.joined'), render: function (row) { return new Date(row.createdAt).toLocaleDateString(); }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('button', { onClick: function () { this.setState({ deleteTarget: row }); }.bind(this), className: 'p-1 text-gray-400 hover:text-danger-500' },
          React.createElement(TrashIcon, { className: 'w-4 h-4' })
        );
      }.bind(this)},
    ];

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('customers.title')),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('customers.subtitle'))
      ),
      React.createElement('input', { type: 'text', placeholder: t('customers.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' }),
      React.createElement(DataTable, { columns: columns, data: data ? data.customers : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('customers.noCustomers') }),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('customers.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('customers.deleteConfirm', { name: this.state.deleteTarget ? this.state.deleteTarget.firstName + ' ' + this.state.deleteTarget.lastName : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Customers);
