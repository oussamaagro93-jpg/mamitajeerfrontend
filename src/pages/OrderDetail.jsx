import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { orderAPI } from '../api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { notify } from '../components/common/Toast';
import { AuthContext } from '../context/AuthContext';
import { formatDzd } from '../utils/money';

var paymentColors = {
  paid: 'badge-success',
  pending: 'badge-warning',
  partially_paid: 'badge-warning',
  refunded: 'badge-danger',
  failed: 'badge-danger',
};

var statusTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

class OrderDetail extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      order: null,
      loading: true,
      newStatus: '',
      cancelReason: '',
      paymentStatus: 'pending',
      paidAmount: '',
      paymentReference: '',
      trackingNumber: '',
    };
  }

  componentDidMount() { this.fetchOrder(); }

  fetchOrder() {
    var self = this;
    var id = self.props.match.params.id;
    orderAPI.getById(id).then(function (res) {
      var order = res.data.data.order;
      self.setState({
        order: order,
        loading: false,
        paymentStatus: order.paymentStatus || 'pending',
        paidAmount: order.paidAmount !== undefined && order.paidAmount !== null ? String(order.paidAmount) : '',
        paymentReference: order.paymentReference || '',
        trackingNumber: order.trackingNumber || '',
      });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || self.props.t('common.error');
      notify(message, 'error');
      self.setState({ loading: false });
    });
  }

  handleStatusUpdate() {
    if (!this.state.newStatus) return;
    var t = this.props.t;
    var self = this;
    var id = self.props.match.params.id;
    var payload = { status: self.state.newStatus };
    if (payload.status === 'cancelled') {
      payload.reason = self.state.cancelReason;
    }
    orderAPI.updateStatus(id, payload).then(function () {
      self.fetchOrder();
      notify(t('orders.statusUpdated'));
      self.setState({ newStatus: '', cancelReason: '' });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
    });
  }

  handlePaymentUpdate() {
    var t = this.props.t;
    var self = this;
    var id = self.props.match.params.id;
    var payload = { paymentStatus: self.state.paymentStatus };
    if (payload.paymentStatus === 'partially_paid') {
      payload.paidAmount = self.state.paidAmount;
    }
    payload.paymentReference = self.state.paymentReference;
    orderAPI.updatePayment(id, payload).then(function () {
      self.fetchOrder();
      notify(t('orders.paymentUpdated'));
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
    });
  }

  handleTrackingUpdate() {
    var t = this.props.t;
    var self = this;
    var id = self.props.match.params.id;
    orderAPI.updateTracking(id, { trackingNumber: self.state.trackingNumber }).then(function () {
      self.fetchOrder();
      notify(t('orders.trackingUpdated'));
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    if (this.state.loading) return React.createElement('div', { className: 'skeleton h-96 rounded-xl' });
    var order = this.state.order;
    if (!order) return React.createElement('p', null, t('orders.notFound'));

    var customerName = order.user
      ? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ')
      : (order.guestName || '');
    var customerEmail = order.email || (order.user ? order.user.email : '');
    var customerPhone = order.guestPhone || '';
    var customerLocation = [order.wilayaName || order.guestWilaya, order.communeName || order.guestCity]
      .filter(Boolean)
      .join(', ');
    var customerAddress = order.deliveryAddress || order.guestAddress || '';
    var permissions = this.context && this.context.user && Array.isArray(this.context.user.permissions)
      ? this.context.user.permissions
      : [];
    var canUpdate = permissions.indexOf('orders.update') !== -1;
    var nextStatuses = canUpdate ? (statusTransitions[order.status] || []) : [];

    return React.createElement('div', { className: 'space-y-6 max-w-5xl' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center space-x-4' },
          React.createElement(Link, { to: '/admin/orders', className: 'text-gray-400 hover:text-gray-600' },
            React.createElement(ArrowLeftIcon, { className: 'w-5 h-5' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('orders.columns.order') + ' ' + order.orderNumber),
            React.createElement('p', { className: 'text-sm text-gray-500' }, new Date(order.createdAt).toLocaleString())
          )
        ),
        React.createElement('div', { className: 'flex items-center space-x-3' },
          canUpdate && nextStatuses.length > 0
            ? React.createElement('select', { value: this.state.newStatus, onChange: function (e) { this.setState({ newStatus: e.target.value }); }.bind(this), className: 'input-field max-w-[150px]' },
                React.createElement('option', { value: '' }, t('orders.changeStatus')),
                nextStatuses.map(function (s) { return React.createElement('option', { key: s, value: s }, t('orders.' + s)); })
              )
            : null,
          canUpdate && nextStatuses.length > 0 && this.state.newStatus === 'cancelled'
            ? React.createElement('input', {
                type: 'text',
                value: this.state.cancelReason,
                placeholder: t('orders.cancelledReason'),
                onChange: function (e) { this.setState({ cancelReason: e.target.value }); }.bind(this),
                className: 'input-field max-w-[220px]',
              })
            : null,
          canUpdate && nextStatuses.length > 0
            ? React.createElement('button', { onClick: this.handleStatusUpdate.bind(this), disabled: !this.state.newStatus, className: 'btn-primary' }, t('orders.update'))
            : null,
          canUpdate && nextStatuses.length === 0
            ? React.createElement('span', { className: 'text-sm text-gray-500' }, t('orders.noFurtherActions'))
            : null
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.columns.status')),
          React.createElement('span', { className: 'badge ' + (order.status === 'delivered' ? 'badge-success' : ['cancelled', 'refunded'].indexOf(order.status) !== -1 ? 'badge-danger' : 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.status))
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.columns.payment')),
          React.createElement('span', { className: 'badge ' + (paymentColors[order.paymentStatus] || 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.paymentStatus)),
          React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, order.paymentMethod || t('orders.na')),
          React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, t('orders.paidAmount') + ': ' + formatDzd(order.paidAmount)),
          React.createElement('p', { className: 'text-xs text-gray-500' }, t('orders.dueAmount') + ': ' + formatDzd(order.dueAmount))
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.shipping')),
          React.createElement('span', { className: 'badge ' + (order.shippingStatus === 'delivered' ? 'badge-success' : 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.shippingStatus)),
          order.trackingNumber ? React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('orders.tracking', { number: order.trackingNumber })) : null
        )
      ),
      canUpdate
        ? React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', { className: 'card p-6' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4' }, t('orders.updatePayment')),
              React.createElement('label', { className: 'label' }, t('orders.columns.payment')),
              React.createElement('select', {
                value: this.state.paymentStatus,
                onChange: function (e) { this.setState({ paymentStatus: e.target.value }); }.bind(this),
                className: 'input-field',
              },
                React.createElement('option', { value: 'pending' }, t('orders.pending')),
                React.createElement('option', { value: 'paid' }, t('orders.paid')),
                React.createElement('option', { value: 'partially_paid' }, t('orders.partially_paid')),
                React.createElement('option', { value: 'refunded' }, t('orders.refunded')),
                React.createElement('option', { value: 'failed' }, t('orders.failed'))
              ),
              this.state.paymentStatus === 'partially_paid'
                ? React.createElement('div', { className: 'mt-3' },
                    React.createElement('label', { className: 'label' }, t('orders.paidAmount')),
                    React.createElement('input', {
                      type: 'number',
                      step: '0.01',
                      min: '0',
                      value: this.state.paidAmount,
                      onChange: function (e) { this.setState({ paidAmount: e.target.value }); }.bind(this),
                      className: 'input-field',
                    })
                  )
                : null,
              React.createElement('div', { className: 'mt-3' },
                React.createElement('label', { className: 'label' }, t('orders.paymentReference')),
                React.createElement('input', {
                  type: 'text',
                  value: this.state.paymentReference,
                  placeholder: t('orders.paymentReferencePlaceholder'),
                  onChange: function (e) { this.setState({ paymentReference: e.target.value }); }.bind(this),
                  className: 'input-field',
                })
              ),
              React.createElement('button', {
                onClick: this.handlePaymentUpdate.bind(this),
                className: 'btn-primary mt-4',
              }, t('common.save'))
            ),
            React.createElement('div', { className: 'card p-6' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4' }, t('orders.updateTracking')),
              React.createElement('label', { className: 'label' }, t('orders.trackingNumber')),
              React.createElement('input', {
                type: 'text',
                value: this.state.trackingNumber,
                onChange: function (e) { this.setState({ trackingNumber: e.target.value }); }.bind(this),
                className: 'input-field',
              }),
              React.createElement('button', {
                onClick: this.handleTrackingUpdate.bind(this),
                className: 'btn-primary mt-4',
              }, t('common.save'))
            )
          )
        : null,
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4' }, t('orders.orderItems')),
          React.createElement('div', { className: 'space-y-3' },
            (order.items || []).map(function (item) {
              return React.createElement('div', { key: item.id, className: 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg' },
                React.createElement('div', { className: 'flex items-center space-x-3' },
                  React.createElement('div', { className: 'w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg' }),
                  React.createElement('div', null,
                    React.createElement('p', { className: 'text-sm font-medium text-gray-900 dark:text-white' }, item.productName),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, t('orders.skuQty', { sku: item.sku, qty: item.quantity }))
                  )
                ),
                React.createElement('p', { className: 'text-sm font-medium' }, formatDzd(item.totalPrice))
              );
            })
          ),
          React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm' },
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.subtotal')), React.createElement('span', null, formatDzd(order.subtotal))),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.shipping')), React.createElement('span', null, formatDzd(order.shippingCost))),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.tax')), React.createElement('span', null, formatDzd(order.taxAmount))),
            order.couponCode ? React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.coupon')), React.createElement('span', { className: 'font-mono' }, order.couponCode)) : null,
            parseFloat(order.discountAmount) > 0 ? React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.discount')), React.createElement('span', { className: 'text-success-600' }, '-' + formatDzd(order.discountAmount))) : null,
            React.createElement('div', { className: 'flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700' }, React.createElement('span', null, t('orders.total')), React.createElement('span', null, formatDzd(order.total)))
          )
        ),
        React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'card p-6' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4' }, t('orders.timeline')),
            React.createElement('div', { className: 'space-y-4' },
              (order.timeline || []).map(function (entry) {
                return React.createElement('div', { key: entry.id, className: 'flex items-start space-x-3' },
                  React.createElement('div', { className: 'w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0' }),
                  React.createElement('div', null,
                    React.createElement('p', { className: 'text-sm font-medium text-gray-900 dark:text-white capitalize' }, t('orders.' + entry.status)),
                    React.createElement('p', { className: 'text-xs text-gray-500' }, entry.description),
                    React.createElement('p', { className: 'text-xs text-gray-400' }, new Date(entry.createdAt).toLocaleString())
                  )
                );
              })
            )
          ),
          React.createElement('div', { className: 'card p-6' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white mb-4' }, t('orders.customer')),
            React.createElement('p', { className: 'text-sm text-gray-900 dark:text-white' }, customerName || t('orders.na')),
            customerPhone ? React.createElement('p', { className: 'text-xs text-gray-500' }, t('orders.phone') + ': ' + customerPhone) : null,
            customerEmail ? React.createElement('p', { className: 'text-xs text-gray-500' }, customerEmail) : null,
            customerLocation ? React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, customerLocation) : null,
            customerAddress ? React.createElement('p', { className: 'text-xs text-gray-500' }, t('orders.address') + ': ' + customerAddress) : null,
            order.deliveryCompanyName
              ? React.createElement('p', { className: 'text-xs text-gray-500 mt-1' }, t('orders.deliveryCompany') + ': ' + order.deliveryCompanyName)
              : null,
            order.cancelledReason
              ? React.createElement('p', { className: 'text-xs text-danger-500 mt-1' }, t('orders.cancelledReason') + ': ' + order.cancelledReason)
              : null
          )
        )
      )
    );
  }
}

export default withTranslation()(OrderDetail);
