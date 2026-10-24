import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import MetaPixel from './utils/pixel';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Storefront from './pages/Storefront';
import Landing from './pages/Landing';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderComplete from './pages/OrderComplete';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Inventory from './pages/Inventory';
import Coupons from './pages/Coupons';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DeliveryCompanies from './pages/DeliveryCompanies';
import Wilayas from './pages/Wilayas';
import ShippingRates from './pages/ShippingRates';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import { getDirection } from './utils/direction';
import i18n from './i18n';

var adminRoles = ['super_admin', 'admin', 'manager', 'employee'];

class App extends React.Component {
  syncLanguage(lang) {
    document.documentElement.dir = getDirection(lang);
    document.documentElement.lang = lang;
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    try { localStorage.setItem('language', lang); } catch (e) {}
  }

  componentDidMount() {
    this.syncLanguage(this.props.language);
    MetaPixel.pageView();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.language !== this.props.language) {
      this.syncLanguage(this.props.language);
    }
    if (prevProps.location.pathname !== this.props.location.pathname) {
      MetaPixel.pageView();
    }
  }

  render() {
    return React.createElement(AuthContext.Consumer, null, function (auth) {
      var user = auth.user;
      var loading = auth.loading;

      if (loading) {
        return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
          React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600' })
        );
      }

      var can = function (permission) {
        return !!(user && Array.isArray(user.permissions) && user.permissions.indexOf(permission) !== -1);
      };
      var guarded = function (Component, permission) {
        return function (routeProps) {
          return can(permission)
            ? React.createElement(Component, routeProps)
            : React.createElement(Redirect, { to: '/403' });
        };
      };

      return React.createElement(Switch, null,
        // Public storefront home. Staff are redirected to the admin dashboard.
        React.createElement(Route, { exact: true, path: '/', render: function () {
          return user && adminRoles.includes(user.role)
            ? React.createElement(Redirect, { to: '/admin' })
            : React.createElement(Landing);
        } }),

        // Public product detail page
        React.createElement(Route, { exact: true, path: '/products/:slug', component: ProductDetail }),

        // Public checkout pages
        React.createElement(Route, { exact: true, path: '/checkout', component: Checkout }),
        React.createElement(Route, { exact: true, path: '/order-success/:orderNumber', component: OrderSuccess }),
        React.createElement(Route, { exact: true, path: '/order-complete/:orderNumber', component: OrderComplete }),

        // Auth pages (redirect to home if already logged in)
        React.createElement(Route, { path: '/login', render: function (routeProps) {
          return user ? React.createElement(Redirect, { to: '/' }) : React.createElement(Login, routeProps);
        } }),
        React.createElement(Route, { path: '/register', render: function (routeProps) {
          return user ? React.createElement(Redirect, { to: '/' }) : React.createElement(Register, routeProps);
        } }),
        React.createElement(Route, { path: '/forgot-password', render: function () {
          return user ? React.createElement(Redirect, { to: '/' }) : React.createElement(ForgotPassword);
        } }),
        React.createElement(Route, { path: '/reset-password/:token', component: ResetPassword }),
        React.createElement(Route, { path: '/403', component: Forbidden }),

        // Admin section (protected + role-gated)
        React.createElement(Route, { path: '/admin', render: function () {
          if (!user) return React.createElement(Redirect, { to: '/login' });
          // Customers have no admin access; send them back to the storefront.
          if (!adminRoles.includes(user.role)) return React.createElement(Redirect, { to: '/' });
          return React.createElement(AdminLayout, null,
            React.createElement(Switch, null,
              React.createElement(Route, { exact: true, path: '/admin', render: function (routeProps) {
                if (can('dashboard.view')) return React.createElement(Dashboard, routeProps);
                if (can('products.view')) return React.createElement(Redirect, { to: '/admin/products' });
                return React.createElement(Redirect, { to: '/403' });
              } }),
              React.createElement(Route, { exact: true, path: '/admin/products', render: guarded(Products, 'products.view') }),
              React.createElement(Route, { exact: true, path: '/admin/products/new', render: guarded(ProductForm, 'products.create') }),
              React.createElement(Route, { exact: true, path: '/admin/products/:id/edit', render: guarded(ProductForm, 'products.update') }),
              React.createElement(Route, { exact: true, path: '/admin/categories', render: guarded(Categories, 'categories.view') }),
              React.createElement(Route, { exact: true, path: '/admin/brands', render: guarded(Brands, 'brands.view') }),
              React.createElement(Route, { exact: true, path: '/admin/orders', render: guarded(Orders, 'orders.view') }),
              React.createElement(Route, { exact: true, path: '/admin/orders/:id', render: guarded(OrderDetail, 'orders.view') }),
              React.createElement(Route, { exact: true, path: '/admin/customers', render: guarded(Customers, 'customers.view') }),
              React.createElement(Route, { exact: true, path: '/admin/customers/:id', render: guarded(CustomerDetail, 'customers.view') }),
              React.createElement(Route, { exact: true, path: '/admin/inventory', render: guarded(Inventory, 'inventory.view') }),
              React.createElement(Route, { exact: true, path: '/admin/coupons', render: guarded(Coupons, 'coupons.view') }),
              React.createElement(Route, { exact: true, path: '/admin/users', render: guarded(Users, 'users.view') }),
              React.createElement(Route, { exact: true, path: '/admin/profile', component: Profile }),
              React.createElement(Route, { exact: true, path: '/admin/settings', render: guarded(Settings, 'settings.view') }),
              React.createElement(Route, { exact: true, path: '/admin/shipping/companies', render: function () {
                if (!['super_admin', 'admin'].includes(user.role)) return React.createElement(Redirect, { to: '/403' });
                return React.createElement(DeliveryCompanies);
              } }),
              React.createElement(Route, { exact: true, path: '/admin/shipping/wilayas', render: function () {
                if (!['super_admin', 'admin'].includes(user.role)) return React.createElement(Redirect, { to: '/403' });
                return React.createElement(Wilayas);
              } }),
              React.createElement(Route, { exact: true, path: '/admin/shipping/rates', render: function () {
                if (!['super_admin', 'admin'].includes(user.role)) return React.createElement(Redirect, { to: '/403' });
                return React.createElement(ShippingRates);
              } }),
            )
          );
        } }),

        // Catch-all 404
        React.createElement(Route, { component: NotFound }),
      );
    });
  }
}

function mapStateToProps(state) {
  return { language: state.language.code };
}

export default withRouter(connect(mapStateToProps)(App));
