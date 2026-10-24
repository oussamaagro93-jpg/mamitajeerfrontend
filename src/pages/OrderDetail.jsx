import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { orderAPI } from '../api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { notify } from '../components/common/Toast';

var statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { order: null, loading: true, newStatus: '' };
  }

  componentDidMount() { this.fetchOrder(); }

  fetchOrder() {
    var self = this;
    var id = self.props.match.params.id;
    orderAPI.getById(id).then(function (res) {
      self.setState({ order: res.data.data.order, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  handleStatusUpdate() {
    if (!this.state.newStatus) return;
    var t = this.props.t;
    var self = this;
    var id = self.props.match.params.id;
    orderAPI.updateStatus(id, { status: self.state.newStatus }).then(function () {
      self.fetchOrder();
      notify(t('orders.statusUpdated'));
      self.setState({ newStatus: '' });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    if (this.state.loading) return React.createElement('div', { className: 'skeleton h-96 rounded-xl' });
    var order = this.state.order;
    if (!order) return React.createElement('p', null, t('orders.notFound'));

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
          React.createElement('select', { value: this.state.newStatus, onChange: function (e) { this.setState({ newStatus: e.target.value }); }.bind(this), className: 'input-field max-w-[150px]' },
            React.createElement('option', { value: '' }, t('orders.changeStatus')),
            statusFlow.map(function (s) { return React.createElement('option', { key: s, value: s }, t('orders.' + s)); }),
            React.createElement('option', { value: 'cancelled' }, t('orders.cancelled'))
          ),
          React.createElement('button', { onClick: this.handleStatusUpdate.bind(this), disabled: !this.state.newStatus, className: 'btn-primary' }, t('orders.update'))
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.columns.status')),
          React.createElement('span', { className: 'badge ' + (order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.status))
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.columns.payment')),
          React.createElement('span', { className: 'badge ' + (order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.paymentStatus)),
          React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, order.paymentMethod || t('orders.na'))
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-500 mb-2' }, t('orders.shipping')),
          React.createElement('span', { className: 'badge ' + (order.shippingStatus === 'delivered' ? 'badge-success' : 'badge-warning') + ' text-sm px-3 py-1' }, t('orders.' + order.shippingStatus)),
          order.trackingNumber ? React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, t('orders.tracking', { number: order.trackingNumber })) : null
        )
      ),
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
                React.createElement('p', { className: 'text-sm font-medium' }, '$' + parseFloat(item.totalPrice).toFixed(2))
              );
            })
          ),
          React.createElement('div', { className: 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1 text-sm' },
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.subtotal')), React.createElement('span', null, '$' + parseFloat(order.subtotal).toFixed(2))),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.shipping')), React.createElement('span', null, '$' + parseFloat(order.shippingCost).toFixed(2))),
            React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.tax')), React.createElement('span', null, '$' + parseFloat(order.taxAmount).toFixed(2))),
            order.couponCode ? React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.coupon')), React.createElement('span', { className: 'font-mono' }, order.couponCode)) : null,
            parseFloat(order.discountAmount) > 0 ? React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', { className: 'text-gray-500' }, t('orders.discount')), React.createElement('span', { className: 'text-success-600' }, '-$' + parseFloat(order.discountAmount).toFixed(2))) : null,
            React.createElement('div', { className: 'flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700' }, React.createElement('span', null, t('orders.total')), React.createElement('span', null, '$' + parseFloat(order.total).toFixed(2)))
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
            React.createElement('p', { className: 'text-sm text-gray-900 dark:text-white' }, (order.user ? order.user.firstName + ' ' + order.user.lastName : '')),
            React.createElement('p', { className: 'text-xs text-gray-500' }, order.email)
          )
        )
      )
    );
  }
}

export default withTranslation()(OrderDetail);
