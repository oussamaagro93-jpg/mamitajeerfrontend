import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { deliveryCompanyAPI } from '../api/shipping';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class DeliveryCompanies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1, search: '',
      modal: null, deleteTarget: null,
      form: { name: '', code: '', phone: '', website: '', contactPerson: '', active: true },
    };
  }

  componentDidMount() { this.fetch(); }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search) {
      this.fetch();
    }
  }

  fetch() {
    var self = this;
    self.setState({ loading: true });
    deliveryCompanyAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var payload = { ...this.state.form };

    var promise = this.state.modal && this.state.modal.id
      ? deliveryCompanyAPI.update(this.state.modal.id, payload)
      : deliveryCompanyAPI.create(payload);

    promise.then(function () {
      self.fetch();
      notify(t('shipping.companySaved'));
      self.setState({ modal: null, form: { name: '', code: '', phone: '', website: '', contactPerson: '', active: true } });
    }).catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(msg, 'error');
    });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    deliveryCompanyAPI.delete(id).then(function () {
      self.fetch();
      notify(t('shipping.companyDeleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  openEdit(company) {
    this.setState({
      form: {
        name: company.name,
        code: company.code,
        phone: company.phone || '',
        website: company.website || '',
        contactPerson: company.contactPerson || '',
        active: company.active,
      },
      modal: company,
    });
  }

  openNew() {
    this.setState({
      form: { name: '', code: '', phone: '', website: '', contactPerson: '', active: true },
      modal: {},
    });
  }

  copyId(id) {
    navigator.clipboard.writeText(id).then(function () {
      notify('ID copied to clipboard');
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var self = this;

    var columns = [
      { key: 'name', label: t('shipping.companyName'), render: function (row) {
        return React.createElement('span', { className: 'font-medium text-gray-900 dark:text-white' }, row.name);
      }},
      { key: 'code', label: t('shipping.companyCode') },
      { key: 'id', label: 'ID', render: function (row) {
        return React.createElement('div', { className: 'flex items-center space-x-1' },
          React.createElement('span', { className: 'text-xs font-mono text-gray-500 truncate max-w-[120px] block' }, row.id),
          React.createElement('button', {
            onClick: function () { self.copyId(row.id); },
            className: 'p-1 text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0',
            title: 'Copy ID',
          },
            React.createElement(ClipboardDocumentIcon, { className: 'w-4 h-4' })
          )
        );
      }},
      { key: 'phone', label: t('shipping.phone'), render: function (row) { return row.phone || '-'; }},
      { key: 'active', label: t('shipping.active'), render: function (row) {
        return React.createElement('span', { className: 'badge ' + (row.active ? 'badge-success' : 'badge-danger') },
          row.active ? t('common.yes') : t('common.no')
        );
      }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('div', { className: 'flex items-center space-x-1' },
          React.createElement('button', { onClick: function () { self.openEdit(row); }, className: 'p-1.5 text-gray-400 hover:text-primary-600 transition-colors', title: t('common.edit') },
            React.createElement(PencilIcon, { className: 'w-4 h-4' })
          ),
          React.createElement('button', { onClick: function () { self.setState({ deleteTarget: row }); }, className: 'p-1.5 text-gray-400 hover:text-danger-500 transition-colors', title: t('common.delete') },
            React.createElement(TrashIcon, { className: 'w-4 h-4' })
          )
        );
      }},
    ];

    var data = this.state.data;

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('shipping.deliveryCompanies')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('shipping.deliveryCompaniesSubtitle'))
        ),
        React.createElement('button', { onClick: function () { self.openNew(); }, className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }),
          t('shipping.addCompany')
        )
      ),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('input', { type: 'text', placeholder: t('common.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' })
      ),
      React.createElement(DataTable, {
        columns: columns,
        data: data ? data.companies : [],
        loading: this.state.loading,
        pagination: data ? data.pagination : null,
        onPageChange: function (p) { self.setState({ page: p }); },
        emptyMessage: t('shipping.noCompanies'),
      }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: this.state.modal && this.state.modal.id ? t('shipping.editCompany') : t('shipping.addCompany') },
        React.createElement('div', { className: 'space-y-4' },
          this.state.modal && this.state.modal.id
            ? React.createElement('div', null,
                React.createElement('label', { className: 'label' }, 'ID'),
                React.createElement('div', { className: 'flex items-center space-x-2' },
                  React.createElement('input', { type: 'text', value: this.state.modal.id, className: 'input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed', readOnly: true }),
                  React.createElement('button', {
                    onClick: function () { self.copyId(self.state.modal.id); },
                    className: 'p-2 text-gray-400 hover:text-primary-600 transition-colors',
                    title: 'Copy ID',
                  },
                    React.createElement(ClipboardDocumentIcon, { className: 'w-5 h-5' })
                  )
                )
              )
            : null,
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.companyName')),
            React.createElement('input', { type: 'text', value: this.state.form.name, onChange: function (e) { var f = Object.assign({}, self.state.form, { name: e.target.value }); self.setState({ form: f }); }, className: 'input-field', required: true })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.companyCode')),
            React.createElement('input', { type: 'text', value: this.state.form.code, onChange: function (e) { var f = Object.assign({}, self.state.form, { code: e.target.value }); self.setState({ form: f }); }, className: 'input-field', required: true, placeholder: 'e.g. yalidine' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.phone')),
            React.createElement('input', { type: 'text', value: this.state.form.phone, onChange: function (e) { var f = Object.assign({}, self.state.form, { phone: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.website')),
            React.createElement('input', { type: 'url', value: this.state.form.website, onChange: function (e) { var f = Object.assign({}, self.state.form, { website: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.contactPerson')),
            React.createElement('input', { type: 'text', value: this.state.form.contactPerson, onChange: function (e) { var f = Object.assign({}, self.state.form, { contactPerson: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
          ),
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('input', { type: 'checkbox', id: 'companyActive', checked: this.state.form.active, onChange: function (e) { var f = Object.assign({}, self.state.form, { active: e.target.checked }); self.setState({ form: f }); }, className: 'w-4 h-4 text-primary-600 border-gray-300 rounded' }),
            React.createElement('label', { htmlFor: 'companyActive', className: 'text-sm text-gray-700 dark:text-gray-300' }, t('shipping.active'))
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { self.setState({ modal: null }); }, className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: function () { self.handleSave(); }, className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('shipping.deleteCompany') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('shipping.deleteConfirm'),
          React.createElement('strong', null, this.state.deleteTarget ? this.state.deleteTarget.name : ''),
          '?'
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { self.setState({ deleteTarget: null }); }, className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { self.handleDelete(self.state.deleteTarget.id); }, className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(DeliveryCompanies);
