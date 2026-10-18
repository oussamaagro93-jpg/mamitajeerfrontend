import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { wilayaAPI } from '../api/shipping';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class Wilayas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1, search: '',
      modal: null, deleteTarget: null,
      form: { code: '', nameFr: '', nameAr: '', active: true },
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
    wilayaAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var payload = { ...this.state.form };

    var promise = this.state.modal && this.state.modal.id
      ? wilayaAPI.update(this.state.modal.id, payload)
      : wilayaAPI.create(payload);

    promise.then(function () {
      self.fetch();
      notify(t('wilaya.saved'));
      self.setState({ modal: null, form: { code: '', nameFr: '', nameAr: '', active: true } });
    }).catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(msg, 'error');
    });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    wilayaAPI.delete(id).then(function () {
      self.fetch();
      notify(t('wilaya.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  openEdit(wilaya) {
    this.setState({
      form: {
        code: wilaya.code,
        nameFr: wilaya.nameFr,
        nameAr: wilaya.nameAr,
        active: wilaya.active,
      },
      modal: wilaya,
    });
  }

  openNew() {
    this.setState({
      form: { code: '', nameFr: '', nameAr: '', active: true },
      modal: {},
    });
  }

  copyId(id) {
    navigator.clipboard.writeText(id).then(function () {
      notify('ID copied');
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var self = this;

    var columns = [
      { key: 'code', label: t('wilaya.code'), render: function (row) {
        return React.createElement('span', { className: 'font-medium text-gray-900 dark:text-white' }, row.code);
      }},
      { key: 'nameFr', label: t('wilaya.nameFr') },
      { key: 'nameAr', label: t('wilaya.nameAr') },
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
      { key: 'active', label: t('wilaya.active'), render: function (row) {
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
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('wilaya.wilayas')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('wilaya.subtitle'))
        ),
        React.createElement('button', { onClick: function () { self.openNew(); }, className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }),
          t('wilaya.add')
        )
      ),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('input', { type: 'text', placeholder: t('common.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' })
      ),
      React.createElement(DataTable, {
        columns: columns,
        data: data ? data.wilayas : [],
        loading: this.state.loading,
        pagination: data ? data.pagination : null,
        onPageChange: function (p) { self.setState({ page: p }); },
        emptyMessage: t('wilaya.empty'),
      }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: this.state.modal && this.state.modal.id ? t('wilaya.edit') : t('wilaya.add') },
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
            React.createElement('label', { className: 'label' }, t('wilaya.code')),
            React.createElement('input', { type: 'text', value: this.state.form.code, onChange: function (e) { var f = Object.assign({}, self.state.form, { code: e.target.value }); self.setState({ form: f }); }, className: 'input-field', required: true, placeholder: 'e.g. 16' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('wilaya.nameFr')),
            React.createElement('input', { type: 'text', value: this.state.form.nameFr, onChange: function (e) { var f = Object.assign({}, self.state.form, { nameFr: e.target.value }); self.setState({ form: f }); }, className: 'input-field', required: true, placeholder: 'e.g. Alger' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('wilaya.nameAr')),
            React.createElement('input', { type: 'text', value: this.state.form.nameAr, onChange: function (e) { var f = Object.assign({}, self.state.form, { nameAr: e.target.value }); self.setState({ form: f }); }, className: 'input-field', required: true, placeholder: 'e.g. الجزائر' })
          ),
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('input', { type: 'checkbox', id: 'wilayaActive', checked: this.state.form.active, onChange: function (e) { var f = Object.assign({}, self.state.form, { active: e.target.checked }); self.setState({ form: f }); }, className: 'w-4 h-4 text-primary-600 border-gray-300 rounded' }),
            React.createElement('label', { htmlFor: 'wilayaActive', className: 'text-sm text-gray-700 dark:text-gray-300' }, t('wilaya.active'))
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { self.setState({ modal: null }); }, className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: function () { self.handleSave(); }, className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('wilaya.delete') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('wilaya.deleteConfirm'),
          React.createElement('strong', null, this.state.deleteTarget ? this.state.deleteTarget.nameFr : ''),
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

export default withTranslation()(Wilayas);
