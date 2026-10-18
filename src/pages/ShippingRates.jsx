import React from 'react';
import { withTranslation } from 'react-i18next';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { shippingRateAPI, deliveryCompanyAPI, wilayaAPI } from '../api/shipping';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class ShippingRates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, loading: true, page: 1,
      companies: [], wilayas: [],
      selectedCompanyId: '', selectedWilayaId: '',
      modal: null, deleteTarget: null,
      importModal: false, importData: '', importPreview: null, importSubmitting: false,
      form: {
        deliveryCompanyId: '', wilayaId: '',
        homeDeliveryPrice: '', deskDeliveryPrice: '',
        homeDeliveryAvailable: true, deskDeliveryAvailable: true,
        estimatedDeliveryDaysMin: '', estimatedDeliveryDaysMax: '',
        active: true,
      },
    };
  }

  componentDidMount() {
    this.fetchCompanies();
    this.fetchWilayas();
    this.fetchRates();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.selectedCompanyId !== this.state.selectedCompanyId || prevState.selectedWilayaId !== this.state.selectedWilayaId) {
      this.fetchRates();
    }
  }

  fetchCompanies() {
    var self = this;
    deliveryCompanyAPI.getAll({ limit: 100 }).then(function (res) {
      self.setState({ companies: res.data.data.companies || [] });
    }).catch(function () {});
  }

  fetchWilayas() {
    var self = this;
    wilayaAPI.getAll({ limit: 100 }).then(function (res) {
      self.setState({ wilayas: res.data.data.wilayas || [] });
    }).catch(function () {});
  }

  fetchRates() {
    var self = this;
    self.setState({ loading: true });
    var params = { page: self.state.page, limit: 20 };
    if (self.state.selectedCompanyId) {
      params.deliveryCompanyId = self.state.selectedCompanyId;
    }
    if (self.state.selectedWilayaId) {
      params.wilayaId = self.state.selectedWilayaId;
    }
    shippingRateAPI.getAll(params).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var payload = {
      ...this.state.form,
      homeDeliveryPrice: parseFloat(this.state.form.homeDeliveryPrice),
      deskDeliveryPrice: parseFloat(this.state.form.deskDeliveryPrice),
      estimatedDeliveryDaysMin: this.state.form.estimatedDeliveryDaysMin ? parseInt(this.state.form.estimatedDeliveryDaysMin, 10) : null,
      estimatedDeliveryDaysMax: this.state.form.estimatedDeliveryDaysMax ? parseInt(this.state.form.estimatedDeliveryDaysMax, 10) : null,
    };

    if (!payload.deliveryCompanyId || !payload.wilayaId) {
      notify(t('shipping.selectCompanyWilaya'), 'error');
      return;
    }

    var promise = this.state.modal && this.state.modal.id
      ? shippingRateAPI.update(this.state.modal.id, payload)
      : shippingRateAPI.create(payload);

    promise.then(function () {
      self.fetchRates();
      notify(t('shipping.rateSaved'));
      self.setState({ modal: null, form: { deliveryCompanyId: '', wilayaId: '', homeDeliveryPrice: '', deskDeliveryPrice: '', homeDeliveryAvailable: true, deskDeliveryAvailable: true, estimatedDeliveryDaysMin: '', estimatedDeliveryDaysMax: '', active: true } });
    }).catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(msg, 'error');
    });
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    shippingRateAPI.delete(id).then(function () {
      self.fetchRates();
      notify(t('shipping.rateDeleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  openEdit(rate) {
    this.setState({
      form: {
        deliveryCompanyId: rate.deliveryCompanyId || rate.deliveryCompany?.id || '',
        wilayaId: rate.wilayaId || rate.wilaya?.id || '',
        homeDeliveryPrice: rate.homeDeliveryPrice,
        deskDeliveryPrice: rate.deskDeliveryPrice,
        homeDeliveryAvailable: rate.homeDeliveryAvailable,
        deskDeliveryAvailable: rate.deskDeliveryAvailable,
        estimatedDeliveryDaysMin: rate.estimatedDeliveryDaysMin || '',
        estimatedDeliveryDaysMax: rate.estimatedDeliveryDaysMax || '',
        active: rate.active,
      },
      modal: rate,
    });
  }

  openNew() {
    this.setState({
      form: { deliveryCompanyId: '', wilayaId: '', homeDeliveryPrice: '', deskDeliveryPrice: '', homeDeliveryAvailable: true, deskDeliveryAvailable: true, estimatedDeliveryDaysMin: '', estimatedDeliveryDaysMax: '', active: true },
      modal: {},
    });
  }

  handleImport() {
    var t = this.props.t;
    var self = this;
    try {
      var parsed = JSON.parse(this.state.importData);
      if (!Array.isArray(parsed)) throw new Error('Expected an array');

      var codeMap = {};
      this.state.wilayas.forEach(function (w) { codeMap[w.code] = w.nameFr; });

      var errors = [];
      parsed.forEach(function (item, i) {
        if (!item.wilayaCode) {
          errors.push('Row ' + (i + 1) + ': wilayaCode is required');
        } else if (!codeMap[String(item.wilayaCode)]) {
          errors.push('Wilaya code ' + item.wilayaCode + ' does not exist.');
        }
      });

      if (errors.length > 0) {
        notify(errors.join('\n'), 'error');
        return;
      }

      self.setState({ importPreview: parsed });
    } catch (e) {
      notify(t('shipping.invalidImportFormat') + ': ' + e.message, 'error');
    }
  }

  confirmImport() {
    var t = this.props.t;
    var self = this;
    if (!this.state.importPreview) return;

    self.setState({ importSubmitting: true });
    shippingRateAPI.bulkImport(self.state.importPreview).then(function (res) {
      self.fetchRates();
      notify(t('shipping.importComplete', { created: res.data.data.created, updated: res.data.data.updated }));
      self.setState({ importModal: false, importData: '', importPreview: null, importSubmitting: false });
    }).catch(function (err) {
      var msg = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(msg, 'error');
      self.setState({ importSubmitting: false });
    });
  }

  render() {
    var t = this.props.t;
    var self = this;

    var columns = [
      { key: 'company', label: t('shipping.company'), render: function (row) {
        return row.deliveryCompany ? row.deliveryCompany.name : '-';
      }},
      { key: 'wilaya', label: t('shipping.wilaya'), render: function (row) {
        return row.wilaya ? (row.wilaya.nameFr + ' (' + row.wilaya.code + ')') : '-';
      }},
      { key: 'homeDeliveryPrice', label: t('shipping.homeDelivery'), render: function (row) {
        return parseFloat(row.homeDeliveryPrice).toFixed(2) + ' DA';
      }},
      { key: 'deskDeliveryPrice', label: t('shipping.deskDelivery'), render: function (row) {
        return parseFloat(row.deskDeliveryPrice).toFixed(2) + ' DA';
      }},
      { key: 'homeDeliveryAvailable', label: t('shipping.homeAvail'), render: function (row) {
        return React.createElement('span', { className: 'badge ' + (row.homeDeliveryAvailable ? 'badge-success' : 'badge-danger') },
          row.homeDeliveryAvailable ? t('common.yes') : t('common.no')
        );
      }},
      { key: 'deskDeliveryAvailable', label: t('shipping.deskAvail'), render: function (row) {
        return React.createElement('span', { className: 'badge ' + (row.deskDeliveryAvailable ? 'badge-success' : 'badge-danger') },
          row.deskDeliveryAvailable ? t('common.yes') : t('common.no')
        );
      }},
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
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('shipping.shippingRates')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, t('shipping.shippingRatesSubtitle'))
        ),
        React.createElement('div', { className: 'flex items-center space-x-3' },
          React.createElement('button', { onClick: function () { self.openNew(); }, className: 'btn-primary' },
            React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }),
            t('shipping.addRate')
          ),
          React.createElement('button', { onClick: function () { self.setState({ importModal: true }); }, className: 'btn-secondary' },
            React.createElement(ArrowUpTrayIcon, { className: 'w-5 h-5 mr-2' }),
            t('shipping.bulkImport')
          )
        )
      ),
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement('select', {
          value: this.state.selectedCompanyId,
          onChange: function (e) { self.setState({ selectedCompanyId: e.target.value, page: 1 }); },
          className: 'input-field max-w-xs',
        },
          React.createElement('option', { value: '' }, t('shipping.allCompanies')),
          this.state.companies.map(function (c) {
            return React.createElement('option', { key: c.id, value: c.id }, c.name);
          })
        ),
        React.createElement('select', {
          value: this.state.selectedWilayaId,
          onChange: function (e) { self.setState({ selectedWilayaId: e.target.value, page: 1 }); },
          className: 'input-field max-w-xs',
        },
          React.createElement('option', { value: '' }, t('wilaya.wilayas')),
          this.state.wilayas.map(function (w) {
            return React.createElement('option', { key: w.id, value: w.id }, w.nameFr + ' (' + w.code + ')');
          })
        )
      ),
      React.createElement(DataTable, {
        columns: columns,
        data: data ? data.rates : [],
        loading: this.state.loading,
        pagination: data ? data.pagination : null,
        onPageChange: function (p) { self.setState({ page: p }); },
        emptyMessage: t('shipping.noRates'),
      }),
      React.createElement(Modal, { open: !!this.state.modal, onClose: function () { this.setState({ modal: null }); }.bind(this), title: this.state.modal && this.state.modal.id ? t('shipping.editRate') : t('shipping.addRate') },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.company')),
            React.createElement('select', {
              value: this.state.form.deliveryCompanyId,
              onChange: function (e) { var f = Object.assign({}, self.state.form, { deliveryCompanyId: e.target.value }); self.setState({ form: f }); },
              className: 'input-field',
            },
              React.createElement('option', { value: '' }, t('shipping.selectCompany')),
              this.state.companies.map(function (c) {
                return React.createElement('option', { key: c.id, value: c.id }, c.name);
              })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.wilaya')),
            React.createElement('select', {
              value: this.state.form.wilayaId,
              onChange: function (e) { var f = Object.assign({}, self.state.form, { wilayaId: e.target.value }); self.setState({ form: f }); },
              className: 'input-field',
            },
              React.createElement('option', { value: '' }, t('shipping.selectWilaya')),
              this.state.wilayas.map(function (w) {
                return React.createElement('option', { key: w.id, value: w.id }, w.nameFr + ' (' + w.code + ')');
              })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.homeDeliveryPrice')),
            React.createElement('input', { type: 'number', step: '0.01', min: '0', value: this.state.form.homeDeliveryPrice, onChange: function (e) { var f = Object.assign({}, self.state.form, { homeDeliveryPrice: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('shipping.deskDeliveryPrice')),
            React.createElement('input', { type: 'number', step: '0.01', min: '0', value: this.state.form.deskDeliveryPrice, onChange: function (e) { var f = Object.assign({}, self.state.form, { deskDeliveryPrice: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
          ),
          React.createElement('div', { className: 'flex items-center space-x-6' },
            React.createElement('div', { className: 'flex items-center space-x-2' },
              React.createElement('input', { type: 'checkbox', id: 'homeAvail', checked: this.state.form.homeDeliveryAvailable, onChange: function (e) { var f = Object.assign({}, self.state.form, { homeDeliveryAvailable: e.target.checked }); self.setState({ form: f }); }, className: 'w-4 h-4' }),
              React.createElement('label', { htmlFor: 'homeAvail', className: 'text-sm' }, t('shipping.homeDeliveryAvailable'))
            ),
            React.createElement('div', { className: 'flex items-center space-x-2' },
              React.createElement('input', { type: 'checkbox', id: 'deskAvail', checked: this.state.form.deskDeliveryAvailable, onChange: function (e) { var f = Object.assign({}, self.state.form, { deskDeliveryAvailable: e.target.checked }); self.setState({ form: f }); }, className: 'w-4 h-4' }),
              React.createElement('label', { htmlFor: 'deskAvail', className: 'text-sm' }, t('shipping.deskDeliveryAvailable'))
            )
          ),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('shipping.estimatedDaysMin')),
              React.createElement('input', { type: 'number', min: '0', value: this.state.form.estimatedDeliveryDaysMin, onChange: function (e) { var f = Object.assign({}, self.state.form, { estimatedDeliveryDaysMin: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('shipping.estimatedDaysMax')),
              React.createElement('input', { type: 'number', min: '0', value: this.state.form.estimatedDeliveryDaysMax, onChange: function (e) { var f = Object.assign({}, self.state.form, { estimatedDeliveryDaysMax: e.target.value }); self.setState({ form: f }); }, className: 'input-field' })
            )
          ),
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('input', { type: 'checkbox', id: 'rateActive', checked: this.state.form.active, onChange: function (e) { var f = Object.assign({}, self.state.form, { active: e.target.checked }); self.setState({ form: f }); }, className: 'w-4 h-4' }),
            React.createElement('label', { htmlFor: 'rateActive', className: 'text-sm' }, t('shipping.active'))
          ),
          React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
            React.createElement('button', { onClick: function () { self.setState({ modal: null }); }, className: 'btn-secondary' }, t('common.cancel')),
            React.createElement('button', { onClick: function () { self.handleSave(); }, className: 'btn-primary' }, t('common.save'))
          )
        )
      ),
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('shipping.deleteRate') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' }, t('shipping.deleteRateConfirm')),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { self.setState({ deleteTarget: null }); }, className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { self.handleDelete(self.state.deleteTarget.id); }, className: 'btn-danger' }, t('common.delete'))
        )
      ),
      React.createElement(Modal, { open: this.state.importModal, onClose: function () { this.setState({ importModal: false, importData: '', importPreview: null }); }.bind(this), title: t('shipping.bulkImportTitle') },
        !this.state.importPreview
          ? React.createElement('div', { className: 'space-y-4' },
              React.createElement('p', { className: 'text-sm text-gray-600 dark:text-gray-400' }, t('shipping.bulkImportHelp')),
              React.createElement('textarea', {
                value: this.state.importData,
                onChange: function (e) { self.setState({ importData: e.target.value }); },
                className: 'input-field font-mono text-xs',
                rows: 10,
                placeholder: '[\n  {\n    "deliveryCompanyId": 1,\n    "wilayaCode": "16",\n    "homeDeliveryPrice": 500,\n    "deskDeliveryPrice": 450\n  }\n]',
              }),
              React.createElement('div', { className: 'flex justify-end space-x-3' },
                React.createElement('button', { onClick: function () { self.setState({ importModal: false }); }, className: 'btn-secondary' }, t('common.cancel')),
                React.createElement('button', { onClick: function () { self.handleImport(); }, className: 'btn-primary' }, t('shipping.preview'))
              )
            )
          : React.createElement('div', { className: 'space-y-4' },
              React.createElement('p', { className: 'text-sm text-green-600' }, t('shipping.importPreviewCount', { count: this.state.importPreview.length })),
              React.createElement('div', { className: 'max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 rounded' },
                React.createElement('table', { className: 'w-full text-xs' },
                  React.createElement('thead', null,
                    React.createElement('tr', { className: 'text-left border-b border-gray-200 dark:border-gray-700' },
                      React.createElement('th', { className: 'px-2 py-1 font-semibold' }, 'Wilaya Code'),
                      React.createElement('th', { className: 'px-2 py-1 font-semibold' }, 'Wilaya Name'),
                      React.createElement('th', { className: 'px-2 py-1 font-semibold' }, 'Home Delivery'),
                      React.createElement('th', { className: 'px-2 py-1 font-semibold' }, 'Desk Delivery')
                    )
                  ),
                  React.createElement('tbody', null,
                    this.state.importPreview.map(function (item, i) {
                      var codeMap = {};
                      self.state.wilayas.forEach(function (w) { codeMap[w.code] = w.nameFr; });
                      var wilayaName = codeMap[String(item.wilayaCode)] || '-';
                      return React.createElement('tr', { key: i, className: 'border-b border-gray-100 dark:border-gray-700 last:border-0' },
                        React.createElement('td', { className: 'px-2 py-1' }, item.wilayaCode),
                        React.createElement('td', { className: 'px-2 py-1' }, wilayaName),
                        React.createElement('td', { className: 'px-2 py-1' }, item.homeDeliveryPrice + ' DA'),
                        React.createElement('td', { className: 'px-2 py-1' }, item.deskDeliveryPrice + ' DA')
                      );
                    })
                  )
                )
              ),
              React.createElement('div', { className: 'flex justify-end space-x-3' },
                React.createElement('button', { onClick: function () { self.setState({ importPreview: null, importData: '' }); }, className: 'btn-secondary' }, t('shipping.editImport')),
                React.createElement('button', { onClick: function () { self.confirmImport(); }, disabled: this.state.importSubmitting, className: 'btn-primary' },
                  this.state.importSubmitting ? t('common.loading') : t('shipping.confirmImport')
                )
              )
            )
      )
    );
  }
}

export default withTranslation()(ShippingRates);
