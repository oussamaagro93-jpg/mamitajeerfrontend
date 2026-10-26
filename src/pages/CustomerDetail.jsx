import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { customerAPI } from '../api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDzd } from '../utils/money';

class CustomerDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { customer: null, loading: true };
  }

  componentDidMount() {
    var self = this;
    var id = self.props.match.params.id;
    customerAPI.getById(id).then(function (res) {
      self.setState({ customer: res.data.data.customer, loading: false });
    }).catch(function () { self.setState({ loading: false }); });
  }

  render() {
    var t = this.props.t;
    if (this.state.loading) return React.createElement('div', { className: 'skeleton h-96 rounded-xl' });
    var customer = this.state.customer;
    if (!customer) return React.createElement('p', null, t('customers.notFound'));

    return React.createElement('div', { className: 'space-y-6 max-w-5xl' },
      React.createElement('div', { className: 'flex items-center space-x-4' },
        React.createElement(Link, { to: '/admin/customers', className: 'text-gray-400 hover:text-gray-600' },
          React.createElement(ArrowLeftIcon, { className: 'w-5 h-5' })
        ),
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, customer.firstName + ' ' + customer.lastName),
          React.createElement('p', { className: 'text-sm text-gray-500' }, customer.email)
        )
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, t('customers.information')),
          React.createElement('div', { className: 'space-y-3 text-sm' },
            React.createElement('p', null, React.createElement('span', { className: 'text-gray-500' }, t('customers.emailLabel')), customer.email),
            React.createElement('p', null, React.createElement('span', { className: 'text-gray-500' }, t('customers.phoneLabel')), customer.phone || '-'),
            React.createElement('p', null, React.createElement('span', { className: 'text-gray-500' }, t('customers.roleLabel')), customer.role),
            React.createElement('p', null, React.createElement('span', { className: 'text-gray-500' }, t('customers.joinedLabel')), new Date(customer.createdAt).toLocaleDateString())
          )
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, t('customers.recentOrders')),
          (customer.orders && customer.orders.length > 0)
            ? customer.orders.slice(0, 5).map(function (order) {
                return React.createElement(Link, { key: order.id, to: '/admin/orders/' + order.id, className: 'flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg' },
                  React.createElement('span', { className: 'text-sm font-medium' }, order.orderNumber),
                  React.createElement('span', { className: 'text-sm' }, formatDzd(order.total))
                );
              })
            : React.createElement('p', { className: 'text-sm text-gray-500' }, t('customers.noOrdersYet'))
        )
      )
    );
  }
}

export default withTranslation()(CustomerDetail);
