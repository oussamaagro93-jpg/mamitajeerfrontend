import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { categoryAPI } from '../api';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import { notify } from '../components/common/Toast';

class Categories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1,
      modal: null, deleteTarget: null,
      form: { name: '', description: '', parentId: '' },
      imageFile: null, imagePreview: null,
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) {
      this.fetchCategories();
    }
  }

  fetchCategories() {
    var self = this;
    self.setState({ loading: true });
    categoryAPI.getAll({ page: self.state.page, limit: 10 }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () {
      self.setState({ loading: false });
    });
  }

  handleImageChange(e) {
    var file = e.target.files[0];
    if (!file) return;
    var self = this;
    var reader = new FileReader();
    reader.onload = function (e) {
      self.setState({ imageFile: file, imagePreview: e.target.result });
    };
    reader.readAsDataURL(file);
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var formData = new FormData();
    formData.append('name', this.state.form.name);
    formData.append('description', this.state.form.description || '');
    if (this.state.form.parentId) {
      formData.append('parentId', this.state.form.parentId);
    }
    if (this.state.imageFile) {
      formData.append('image', this.state.imageFile);
    }

    if (this.state.modal && this.state.modal.id) {
      categoryAPI.update(this.state.modal.id, formData).then(function () {
        self.fetchCategories();
        notify(t('categories.updated'));
        self.setState({ modal: null, form: { name: '', description: '', parentId: '' }, imageFile: null, imagePreview: null });
      }).catch(function () {});
    } else {
      categoryAPI.create(formData).then(function () {
        self.fetchCategories();
        notify(t('categories.created'));
        self.setState({ modal: null, form: { name: '', description: '', parentId: '' }, imageFile: null, imagePreview: null });
      }).catch(function () {});
    }
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    categoryAPI.delete(id).then(function () {
      self.fetchCategories();
      notify(t('categories.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  openEdit(cat) {
    this.setState({
      form: { name: cat.name, description: cat.description || '', parentId: cat.parentId || '' },
      modal: cat,
      imageFile: null,
      imagePreview: cat.image || null,
    });
  }

  openNew() {
    this.setState({
      form: { name: '', description: '', parentId: '' },
      modal: {},
      imageFile: null,
      imagePreview: null,
    });
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;

    var columns = [
      { key: 'name', label: t('categories.name'), render: function (row) { return React.createElement('span', { className: 'font-medium text-gray-900 dark:text-white' }, row.name); }},
      { key: 'slug', label: t('categories.slug') },
      { key: 'parent', label: t('categories.parent'), render: function (row) { return row.parent ? row.parent.name : '-'; }},
      { key: 'isActive', label: t('categories.active'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('categories.active') : t('categories.inactive')); }},
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
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('categories.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('categories.subtitle'))
        ),
        React.createElement('button', { onClick: this.openNew.bind(this), className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('categories.addCategory')
        )
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.categories : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('categories.noCategories') }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: this.state.modal && this.state.modal.id ? t('categories.editCategory') : t('categories.newCategory') },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('categories.name')),
            React.createElement('input', { value: this.state.form.name, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { name: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('categories.description')),
            React.createElement('textarea', { value: this.state.form.description, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { description: e.target.value }) }); }.bind(this), rows: 2, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('categories.image')),
            React.createElement('div', { className: 'flex items-center space-x-3' },
              React.createElement('label', { className: 'cursor-pointer btn-secondary text-sm px-3 py-2' },
                React.createElement('span', null, t('common.chooseFile')),
                React.createElement('input', { type: 'file', accept: 'image/jpeg,image/png,image/gif,image/webp', onChange: this.handleImageChange.bind(this), className: 'hidden' })
              ),
              (this.state.imagePreview
                ? React.createElement('img', { src: this.state.imagePreview, alt: 'preview', className: 'w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700' })
                : React.createElement('div', { className: 'w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400' }, 'No image')
              )
            )
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { this.setState({ modal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: this.handleSave.bind(this), className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('categories.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('categories.deleteConfirm', { name: this.state.deleteTarget ? this.state.deleteTarget.name : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Categories);
