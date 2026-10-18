import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { userAPI } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1,
      modal: null, deleteTarget: null,
      form: { firstName: '', lastName: '', email: '', password: '', role: 'employee' },
    };
  }

  componentDidMount() { this.fetchUsers(); }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) this.fetchUsers();
  }

  fetchUsers() {
    var self = this;
    self.setState({ loading: true });
    userAPI.getAll({ page: self.state.page, limit: 10 }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    userAPI.create(self.state.form).then(function () {
      self.fetchUsers(); notify(t('users.created'));
      self.setState({ modal: null });
    }).catch(function () {});
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    userAPI.delete(id).then(function () {
      self.fetchUsers(); notify(t('users.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var columns = [
      { key: 'name', label: t('users.columns.user'), render: function (row) { return React.createElement('span', { className: 'font-medium' }, row.firstName + ' ' + row.lastName); }},
      { key: 'email', label: t('users.columns.email') },
      { key: 'role', label: t('users.columns.role'), render: function (row) { return React.createElement('span', { className: 'badge bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 capitalize' }, row.role.replace('_', ' ')); }},
      { key: 'isActive', label: t('users.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('users.active') : t('users.inactive')); }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('div', { className: 'flex space-x-2' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: row }); }.bind(this), className: 'p-1 text-gray-400 hover:text-danger-500' },
            React.createElement(TrashIcon, { className: 'w-4 h-4' })
          )
        );
      }.bind(this)},
    ];

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('users.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('users.subtitle'))
        ),
        React.createElement('button', { onClick: function () { this.setState({ form: { firstName: '', lastName: '', email: '', password: '', role: 'employee' }, modal: {} }); }.bind(this), className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('users.addUser')
        )
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.users : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('users.noUsers') }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: t('users.newUser') },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('users.firstName')),
              React.createElement('input', { value: this.state.form.firstName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { firstName: e.target.value }) }); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('users.lastName')),
              React.createElement('input', { value: this.state.form.lastName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { lastName: e.target.value }) }); }.bind(this), className: 'input-field' })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('users.email')),
            React.createElement('input', { type: 'email', value: this.state.form.email, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { email: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('users.password')),
            React.createElement('input', { type: 'password', value: this.state.form.password, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { password: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('users.role')),
            React.createElement('select', { value: this.state.form.role, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { role: e.target.value }) }); }.bind(this), className: 'input-field' },
              React.createElement('option', { value: 'super_admin' }, t('users.superAdmin')),
              React.createElement('option', { value: 'admin' }, t('users.admin')),
              React.createElement('option', { value: 'manager' }, t('users.manager')),
              React.createElement('option', { value: 'employee' }, t('users.employee'))
            )
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { this.setState({ modal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: this.handleSave.bind(this), className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('users.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 mb-6' },
          t('users.deleteConfirm', { name: this.state.deleteTarget ? this.state.deleteTarget.firstName + ' ' + this.state.deleteTarget.lastName : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Users);
