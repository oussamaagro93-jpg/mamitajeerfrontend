import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { couponAPI } from '../api';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class Coupons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1,
      modal: null, deleteTarget: null,
      form: { code: '', type: 'percentage', value: '', minOrderAmount: 0, usageLimit: '', startDate: '', endDate: '' },
    };
  }

  componentDidMount() { this.fetchCoupons(); }

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

  handleSave() {
    var t = this.props.t;
    var self = this;
    couponAPI.create(self.state.form).then(function () {
      self.fetchCoupons(); notify(t('coupons.created'));
      self.setState({ modal: null });
    }).catch(function () {});
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    couponAPI.delete(id).then(function () {
      self.fetchCoupons(); notify(t('coupons.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var columns = [
      { key: 'code', label: t('coupons.columns.code'), render: function (row) { return React.createElement('span', { className: 'font-mono font-medium text-primary-600' }, row.code); }},
      { key: 'type', label: t('coupons.columns.type'), render: function (row) { return React.createElement('span', { className: 'capitalize' }, row.type.replace('_', ' ')); }},
      { key: 'value', label: t('coupons.columns.value'), render: function (row) { return row.type === 'percentage' ? row.value + '%' : '$' + parseFloat(row.value).toFixed(2); }},
      { key: 'usedCount', label: t('coupons.columns.used'), render: function (row) { return row.usedCount + (row.usageLimit ? ' / ' + row.usageLimit : ''); }},
      { key: 'isActive', label: t('coupons.columns.status'), render: function (row) { return React.createElement('span', { className: 'badge ' + (row.isActive ? 'badge-success' : 'badge-danger') }, row.isActive ? t('coupons.active') : t('coupons.inactive')); }},
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
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('coupons.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('coupons.subtitle'))
        ),
        React.createElement('button', { onClick: function () { this.setState({ form: { code: '', type: 'percentage', value: '', minOrderAmount: 0, usageLimit: '', startDate: '', endDate: '' }, modal: {} }); }.bind(this), className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('coupons.addCoupon')
        )
      ),
      React.createElement(DataTable, { columns: columns, data: data ? data.coupons : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('coupons.noCoupons') }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: t('coupons.newCoupon') },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.code')),
            React.createElement('input', { value: this.state.form.code, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { code: e.target.value.toUpperCase() }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.type')),
            React.createElement('select', { value: this.state.form.type, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { type: e.target.value }) }); }.bind(this), className: 'input-field' },
              React.createElement('option', { value: 'percentage' }, t('coupons.percentage')),
              React.createElement('option', { value: 'fixed' }, t('coupons.fixed')),
              React.createElement('option', { value: 'free_shipping' }, t('coupons.freeShipping'))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('coupons.value')),
            React.createElement('input', { type: 'number', step: '0.01', value: this.state.form.value, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { value: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { this.setState({ modal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: this.handleSave.bind(this), className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('coupons.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 mb-6' },
          t('coupons.deleteConfirm', { code: this.state.deleteTarget ? this.state.deleteTarget.code : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Coupons);
