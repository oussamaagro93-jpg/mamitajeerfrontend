import React from 'react';
import { withTranslation } from 'react-i18next';
import { inventoryAPI, warehouseAPI, productAPI } from '../api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import { notify } from '../components/common/Toast';

class Inventory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null, lowStock: null, loading: true, page: 1,
      deleteTarget: null, modal: null,
      form: { productId: '', warehouseId: '', quantity: 0 },
      products: [], warehouses: [], formLoading: false, productSearch: '',
    };
  }

  componentDidMount() { this.fetchData(); }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page) { this.fetchData(); }
  }

  fetchData() {
    var self = this;
    self.setState({ loading: true });
    inventoryAPI.getAll({ page: self.state.page, limit: 10 }).then(function (res) {
      self.setState({ data: res.data.data, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
    inventoryAPI.getLowStock({ limit: 5 }).then(function (res) {
      self.setState({ lowStock: res.data.data });
    }).catch(function () {});
  }

  loadFormData() {
    var self = this;
    self.setState({ formLoading: true });
    Promise.all([
      warehouseAPI.getAll(),
      productAPI.getAll({ limit: 200, status: 'published' }),
    ]).then(function (results) {
      self.setState({
        warehouses: results[0].data.data.warehouses || [],
        products: results[1].data.data.products || [],
        formLoading: false,
      });
    }).catch(function () { self.setState({ formLoading: false }); });
  }

  openAdd() {
    this.setState({
      modal: {},
      form: { productId: '', warehouseId: '', quantity: 0 },
      productSearch: '',
    });
    this.loadFormData();
  }

  openEdit(item) {
    this.setState({
      modal: item,
      form: {
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
      },
      productSearch: item.product ? item.product.name : '',
    });
    this.loadFormData();
  }

  handleSave() {
    var t = this.props.t;
    var self = this;
    var form = this.state.form;

    if (!form.productId || !form.warehouseId || form.quantity < 0) return;

    if (this.state.modal && this.state.modal.id) {
      inventoryAPI.update(this.state.modal.id, { quantity: form.quantity }).then(function () {
        self.fetchData(); notify(t('inventory.updated'));
        self.setState({ modal: null });
      }).catch(function () {});
    } else {
      inventoryAPI.create(form).then(function () {
        self.fetchData(); notify(t('inventory.created'));
        self.setState({ modal: null });
      }).catch(function () {});
    }
  }

  handleDelete(id) {
    var t = this.props.t;
    var self = this;
    inventoryAPI.delete(id).then(function () {
      self.fetchData(); notify(t('inventory.deleted'));
      self.setState({ deleteTarget: null });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    var data = this.state.data;
    var lowStock = this.state.lowStock;

    var columns = [
      { key: 'product', label: t('inventory.columns.product'), render: function (row) { return React.createElement('span', { className: 'font-medium' }, row.product ? row.product.name : '-'); }},
      { key: 'warehouse', label: t('inventory.columns.warehouse'), render: function (row) { return row.warehouse ? row.warehouse.name : '-'; }},
      { key: 'quantity', label: t('inventory.columns.quantity') },
      { key: 'reservedQuantity', label: t('inventory.columns.reserved') },
      { key: 'availableQuantity', label: t('inventory.columns.available'), render: function (row) { return row.quantity - row.reservedQuantity; }},
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

    var filteredProducts = this.state.products.filter(function (p) {
      return !this.state.productSearch || p.name.toLowerCase().includes(this.state.productSearch.toLowerCase());
    }.bind(this));

    return React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('inventory.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('inventory.subtitle'))
        ),
        React.createElement('button', { onClick: this.openAdd.bind(this), className: 'btn-primary' },
          React.createElement(PlusIcon, { className: 'w-5 h-5 mr-2' }), t('inventory.addItem')
        )
      ),
      lowStock && lowStock.products && lowStock.products.length > 0
        ? React.createElement('div', { className: 'card p-6 border-l-4 border-warning-500' },
            React.createElement('h3', { className: 'font-semibold text-warning-600 mb-2' }, t('inventory.lowStockAlert')),
            React.createElement('div', { className: 'space-y-2' },
              lowStock.products.slice(0, 5).map(function (p) {
                return React.createElement('div', { key: p.id, className: 'flex justify-between text-sm' },
                  React.createElement('span', null, p.name),
                  React.createElement('span', { className: 'font-medium' }, t('inventory.remaining', { quantity: p.quantity }))
                );
              })
            )
          )
        : null,
      React.createElement(DataTable, { columns: columns, data: data ? data.items : [], loading: this.state.loading, pagination: data ? data.pagination : null, onPageChange: function (p) { this.setState({ page: p }); }.bind(this), emptyMessage: t('inventory.noItems') }),

      // Add/Edit Modal
      React.createElement(Modal, {
        open: !!this.state.modal,
        onClose: function () { this.setState({ modal: null }); }.bind(this),
        title: this.state.modal && this.state.modal.id ? t('inventory.editItem') : t('inventory.addItem'),
      },
        this.state.formLoading
          ? React.createElement('div', { className: 'flex items-center justify-center py-8' },
              React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent' })
            )
          : React.createElement('div', { className: 'space-y-4' },
              // Product selector
              React.createElement('div', null,
                React.createElement('label', { className: 'label' }, t('inventory.form.product')),
                this.state.modal && this.state.modal.id
                  ? React.createElement('p', { className: 'text-sm text-gray-700 dark:text-gray-300 py-2' },
                      this.state.modal.product ? this.state.modal.product.name : '-'
                    )
                  : React.createElement('div', null,
                      React.createElement('input', {
                        type: 'text',
                        value: this.state.productSearch,
                        onChange: function (e) { this.setState({ productSearch: e.target.value }); }.bind(this),
                        placeholder: t('inventory.form.searchProduct'),
                        className: 'input-field mb-2',
                      }),
                      React.createElement('select', {
                        value: this.state.form.productId,
                        onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { productId: e.target.value }) }); }.bind(this),
                        className: 'input-field',
                        required: true,
                        size: Math.min(filteredProducts.length || 1, 5),
                      },
                        filteredProducts.length === 0
                          ? React.createElement('option', { value: '' }, t('inventory.form.noProducts'))
                          : filteredProducts.map(function (p) {
                              return React.createElement('option', { key: p.id, value: p.id }, p.name + ' (' + (p.sku || '-') + ')');
                            })
                      )
                    )
              ),
              // Warehouse selector
              React.createElement('div', null,
                React.createElement('label', { className: 'label' }, t('inventory.form.warehouse')),
                this.state.modal && this.state.modal.id
                  ? React.createElement('p', { className: 'text-sm text-gray-700 dark:text-gray-300 py-2' },
                      this.state.modal.warehouse ? this.state.modal.warehouse.name : '-'
                    )
                  : React.createElement('select', {
                      value: this.state.form.warehouseId,
                      onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { warehouseId: e.target.value }) }); }.bind(this),
                      className: 'input-field',
                      required: true,
                    },
                      React.createElement('option', { value: '' }, t('inventory.form.selectWarehouse')),
                      this.state.warehouses.map(function (w) {
                        return React.createElement('option', { key: w.id, value: w.id }, w.name);
                      })
                    )
              ),
              // Quantity
              React.createElement('div', null,
                React.createElement('label', { className: 'label' }, t('inventory.columns.quantity')),
                React.createElement('input', {
                  type: 'number',
                  value: this.state.form.quantity,
                  onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { quantity: parseInt(e.target.value) || 0 }) }); }.bind(this),
                  className: 'input-field',
                  min: 0,
                  required: true,
                })
              ),
              // Actions
              React.createElement('div', { className: 'flex justify-end space-x-3 pt-2' },
                React.createElement('button', { onClick: function () { this.setState({ modal: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
                React.createElement('button', {
                  onClick: this.handleSave.bind(this),
                  disabled: !this.state.form.productId || !this.state.form.warehouseId,
                  className: 'btn-primary',
                }, this.state.modal && this.state.modal.id ? t('common.save') : t('inventory.form.create'))
              )
            )
      ),

      // Delete Modal
      React.createElement(Modal, { open: !!this.state.deleteTarget, onClose: function () { this.setState({ deleteTarget: null }); }.bind(this), title: t('inventory.deleteTitle') },
        React.createElement('p', { className: 'text-gray-600 dark:text-gray-400 mb-6' },
          t('inventory.deleteConfirm', { name: this.state.deleteTarget && this.state.deleteTarget.product ? this.state.deleteTarget.product.name : '' })
        ),
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { onClick: function () { this.setState({ deleteTarget: null }); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { onClick: function () { this.handleDelete(this.state.deleteTarget.id); }.bind(this), className: 'btn-danger' }, t('common.delete'))
        )
      )
    );
  }
}

export default withTranslation()(Inventory);