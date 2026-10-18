import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { brandAPI } from '../api';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import { notify } from '../components/common/Toast';

class Brands extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1, search: '',
      modal: null, deleteTarget: null,
      form: { name: '', description: '', website: '' },
    };
  }

  componentDidMount() { this.fetchBrands(); }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.search !== this.state.search) { this.fetchBrands(); }
  }

  fetchBrands() {
    var self = this;
    self.setState({ loading: true });
    brandAPI.getAll({ page: self.state.page, limit: 10, search: self.state.search }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    if (this.state.modal && this.state.modal.id) {
      brandAPI.update(this.state.modal.id, { id: this.state.modal.id, data: this.state.form }).then(function () {
        self.fetchBrands(); notify(t('brands.updated'));
        self.setState({ modal: null, form: { name: '', description: '', website: '' } });
      }).catch(function () {});
    } else {
      brandAPI.create(this.state.form).then(function () {
        self.fetchBrands(); notify(t('brands.created'));
        self.setState({ modal: null, form: { name: '', description: '', website: '' } });
      }).catch(function () {});
    }
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    brandAPI.delete(id).then(function () {
      self.fetchBrands(); notify(t('brands.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  openEdit(brand) {
    this.setState({ form: { name: brand.name, description: brand.description || '', website: brand.website || '' }, modal: brand });
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var columns = [
      { key: 'name', label: t('brands.name'), render: function (row) { return React.createElement('span', { className: 'font-medium' }, row.name); }},
      { key: 'slug', label: t('brands.slug') },
      { key: 'website', label: t('brands.website'), render: function (row) { return row.website || '-'; }},
      { key: 'isActive', label: t('brands.active'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('brands.active') : t('brands.inactive')); }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('div', { className: 'flex space-x-2' },
          React.createElement('button', { onClick: function () { this.openEdit(row); }.bind(this), className: 'p-1 text-gray-400 hover:text-primary-600' },
            React.createElement(PencilIcon, { className: 'w-4 h-4' })
          ),
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: row }); }.bind(this), className: 'p-1 text-gray-400 hover:text-danger-500' },
            React.createElement(TrashIcon, { className: 'w-4 h-4' })
          )
        );
      }.bind(this)},
    ];

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('brands.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('brands.subtitle'))
        ),
        React.createElement('button', { onClick: function () { this.setState({ form: { name: '', description: '', website: '' }, modal: {} }); }.bind(this), className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('brands.addBrand')
        )
      ),
      React.createElement('input', { type: 'text', placeholder: t('brands.search'), value: this.state.search, onChange: function (e) { this.setState({ search: e.target.value, page: 1 }); }.bind(this), className: 'input-field max-w-xs' }),
      React.createElement(DataTable, { columns: columns, data: data ? data.brands : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('brands.noBrands') }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: this.state.modal && this.state.modal.id ? t('brands.editBrand') : t('brands.newBrand') },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('brands.name')),
            React.createElement('input', { value: this.state.form.name, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('brands.description')),
            React.createElement('textarea', { value: this.state.form.description, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { description: e.target.value }) }); }.bind(this), rows: 2, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('brands.website')),
            React.createElement('input', { value: this.state.form.website, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { website: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { this.setState({ modal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: this.handleSave.bind(this), className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('brands.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('brands.deleteConfirm', { name: this.state.deleteTarget ? this.state.deleteTarget.name : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Brands);
