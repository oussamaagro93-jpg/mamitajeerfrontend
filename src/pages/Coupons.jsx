import React from 'react';
import { withTranslation } from 'react-i18next';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { categoryAPI, couponAPI, productAPI } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

function emptyForm() {
  return {
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    endDate: '',
    isActive: true,
    description: '',
    productIds: [],
    categoryIds: [],
  };
}

function dateInputValue(value) {
  if (!value) return '';
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

class Coupons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      page: 1,
      modal: null,
      editingId: null,
      deleteTarget: null,
      products: [],
      categories: [],
      form: emptyForm(),
    };
  }

  componentDidMount() {
    this.fetchCoupons();
    this.fetchRestrictionOptions();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) this.fetchCoupons();
  }

  fetchCoupons() {
    var self = this;
    self.setState({ loading: true });
    couponAPI.getAll({ page: self.state.page, limit: 10 }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  fetchRestrictionOptions() {
    var self = this;
    Promise.all([
      productAPI.getAll({ page: 1, limit: 500 }),
      categoryAPI.getAll({ page: 1, limit: 500 }),
    ]).then(function (results) {
      self.setState({
        products: (results[0].data.data && results[0].data.data.products) || [],
        categories: (results[1].data.data && results[1].data.data.categories) || [],
      });
    }).catch(function () {});
  }

  openCreate() {
    this.setState({ form: emptyForm(), editingId: null, modal: {} });
  }

  openEdit(row) {
    this.setState({
      editingId: row.id,
      form: {
        code: row.code || '',
        type: row.type || 'percentage',
        value: row.value !== undefined && row.value !== null ? String(row.value) : '',
        minOrderAmount: row.minOrderAmount !== undefined && row.minOrderAmount !== null ? String(row.minOrderAmount) : 0,
        maxDiscountAmount: row.maxDiscountAmount !== undefined && row.maxDiscountAmount !== null ? String(row.maxDiscountAmount) : '',
        usageLimit: row.usageLimit !== undefined && row.usageLimit !== null ? String(row.usageLimit) : '',
        perUserLimit: row.perUserLimit !== undefined && row.perUserLimit !== null ? String(row.perUserLimit) : 1,
        startDate: dateInputValue(row.startDate),
        endDate: dateInputValue(row.endDate),
        isActive: row.isActive !== false,
        description: row.description || '',
        productIds: (row.productIds || []).map(Number),
        categoryIds: (row.categoryIds || []).map(Number),
      },
      modal: {},
    });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var form = this.state.form;
    var payload = {
      code: form.code,
      type: form.type,
      value: form.type === 'free_shipping' ? 0 : form.value,
      minOrderAmount: form.minOrderAmount,
      maxDiscountAmount: form.maxDiscountAmount === '' ? null : form.maxDiscountAmount,
      usageLimit: form.usageLimit === '' ? null : form.usageLimit,
      perUserLimit: form.perUserLimit === '' ? null : form.perUserLimit,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      isActive: form.isActive,
      description: form.description || null,
      productIds: form.productIds,
      categoryIds: form.categoryIds,
    };

    var request = this.state.editingId
      ? couponAPI.update(this.state.editingId, payload)
      : couponAPI.create(payload);

    request.then(function () {
      self.fetchCoupons();
      notify(t(self.state.editingId ? 'coupons.updated' : 'coupons.created'));
      self.setState({ modal: null, editingId: null, form: emptyForm() });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
    });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    couponAPI.delete(id).then(function () {
      self.fetchCoupons(); notify(t('coupons.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  updateField(field, value) {
    this.setState(function (prev) {
      return { form: Object.assign({}, prev.form, { [field]: value }) };
    });
  }

  updateMultiSelect(field, event) {
    var values = Array.from(event.target.selectedOptions).map(function (option) {
      return Number(option.value);
    });
    this.updateField(field, values);
  }

  renderSelectOptions(items, labelKey) {
    return items.map(function (item) {
      return React.createElement('option', {
        key: item.id,
        value: String(item.id),
      }, item[labelKey] || item.name || ('#' + item.id));
    });
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var state = this.state;
    var self = this;
    var typeLabels = {
      percentage: t('coupons.percentage'),
      fixed: t('coupons.fixed'),
      free_shipping: t('coupons.freeShipping'),
    };
    var columns = [
      { key: 'code', label: t('coupons.columns.code'), render: function (row) { return React.createElement('span', { className: 'font-mono font-medium text-primary-600' }, row.code); }},
      { key: 'type', label: t('coupons.columns.type'), render: function (row) { return React.createElement('span', null, typeLabels[row.type] || row.type); }},
      { key: 'value', label: t('coupons.columns.value'), render: function (row) {
        if (row.type === 'free_shipping') return t('coupons.freeShipping');
        return row.type === 'percentage' ? row.value + '%' : row.value + ' DA';
      }},
      { key: 'usedCount', label: t('coupons.columns.used'), render: function (row) { return row.usedCount + (row.usageLimit ? ' / ' + row.usageLimit : ''); }},
      { key: 'isActive', label: t('coupons.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('coupons.active') : t('coupons.inactive')); }},
      { key: 'actions', label: '', render: function (row) {
        return React.createElement('div', { className: 'flex space-x-2' },
          React.createElement('button', { onClick: function () { self.openEdit(row); }, className: 'p-1 text-gray-400 hover:text-primary-600' },
            React.createElement(PencilIcon, { className: 'w-4 h-4' })
          ),
          React.createElement('button', { onClick: function () { self.setState({ deleteTarget: row }); }, className: 'p-1 text-gray-400 hover:text-danger-500' },
            React.createElement(TrashIcon, { className: 'w-4 h-4' })
          )
        );
      }},
    ];

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('coupons.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('coupons.subtitle'))
        ),
        React.createElement('button', { onClick: function () { self.openCreate(); }, className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('coupons.addCoupon')
        )
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.coupons : [], loading: state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { self.setState({ page: p }); }, emptyMessage: t('coupons.noCoupons') }),
      React.createElement(Modal, { open: !!state.modal, onClose: function () { self.setState({ modal: null }); }, title: state.editingId ? t('coupons.editCoupon') : t('coupons.newCoupon') },
        React.createElement('div', { className: 'space-y-4 max-h-[70vh] overflow-y-auto pr-1' },
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.code')),
            React.createElement('input', { value: state.form.code, onChange: function (e) { self.updateField('code', e.target.value.toUpperCase()); }, className: 'input-field' })
          ),
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.type')),
              React.createElement('select', { value: state.form.type, onChange: function (e) { self.updateField('type', e.target.value); }, className: 'input-field' },
                React.createElement('option', { value: 'percentage' }, t('coupons.percentage')),
                React.createElement('option', { value: 'fixed' }, t('coupons.fixed')),
                React.createElement('option', { value: 'free_shipping' }, t('coupons.freeShipping'))
              )
            ),
            state.form.type !== 'free_shipping'
              ? React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, state.form.type === 'percentage' ? t('coupons.percentageValue') : t('coupons.fixedValue')),
                  React.createElement('input', { type: 'number', step: '0.01', min: '0', value: state.form.value, onChange: function (e) { self.updateField('value', e.target.value); }, className: 'input-field' })
                )
              : null
          ),
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.minOrderAmount')),
              React.createElement('input', { type: 'number', step: '0.01', min: '0', value: state.form.minOrderAmount, onChange: function (e) { self.updateField('minOrderAmount', e.target.value); }, className: 'input-field' })
            ),
            state.form.type === 'percentage'
              ? React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('coupons.maxDiscountAmount')),
                  React.createElement('input', { type: 'number', step: '0.01', min: '0', value: state.form.maxDiscountAmount, onChange: function (e) { self.updateField('maxDiscountAmount', e.target.value); }, className: 'input-field' })
                )
              : null
          ),
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.usageLimit')),
              React.createElement('input', { type: 'number', min: '0', value: state.form.usageLimit, onChange: function (e) { self.updateField('usageLimit', e.target.value); }, className: 'input-field', placeholder: t('coupons.unlimited') })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.perUserLimit')),
              React.createElement('input', { type: 'number', min: '0', value: state.form.perUserLimit, onChange: function (e) { self.updateField('perUserLimit', e.target.value); }, className: 'input-field' })
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.startDate')),
              React.createElement('input', { type: 'date', value: state.form.startDate, onChange: function (e) { self.updateField('startDate', e.target.value); }, className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('coupons.endDate')),
              React.createElement('input', { type: 'date', value: state.form.endDate, onChange: function (e) { self.updateField('endDate', e.target.value); }, className: 'input-field' })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.products')),
            React.createElement('select', {
              multiple: true,
              value: state.form.productIds.map(String),
              onChange: function (e) { self.updateMultiSelect('productIds', e); },
              className: 'input-field h-28',
            }, self.renderSelectOptions(state.products, 'name')),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('coupons.restrictionsHint'))
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.categories')),
            React.createElement('select', {
              multiple: true,
              value: state.form.categoryIds.map(String),
              onChange: function (e) { self.updateMultiSelect('categoryIds', e); },
              className: 'input-field h-28',
            }, self.renderSelectOptions(state.categories, 'name')),
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.description')),
            React.createElement('textarea', { value: state.form.description, onChange: function (e) { self.updateField('description', e.target.value); }, className: 'input-field', rows: 2 })
          ),
          React.createElement('label', { className: 'flex items-center space-x-2 text-sm text-gray-700' },
            React.createElement('input', { type: 'checkbox', checked: state.form.isActive, onChange: function (e) { self.updateField('isActive', e.target.checked); } }),
            React.createElement('span', null, t('coupons.active'))
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { self.setState({ modal: null }); }, className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: function () { self.handleSave(); }, className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!state.deleteTarget, onClose: function () { self.setState({ deleteTarget: null }); }, title: t('coupons.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 mb-6' },
          t('coupons.deleteConfirm', { code: state.deleteTarget ? state.deleteTarget.code : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { self.setState({ deleteTarget: null }); }, className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { self.handleDelete(state.deleteTarget.id); }, className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Coupons);
