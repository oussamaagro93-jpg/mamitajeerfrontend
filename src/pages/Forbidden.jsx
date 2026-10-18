import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';

class Forbidden extends React.Component {
  render() {
    var t = this.props.t;
    return React.createElement(AuthContext.Consumer, null, function (auth) {
      var isLoggedIn = !!auth.user;
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-4' },
        React.createElement('div', { className: 'text-center' },
          React.createElement('p', { className: 'text-6xl font-bold text-danger-500' }, t('errors.forbidden.code')),
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white mt-4' }, t('errors.forbidden.title')),
          React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-2' }, t('errors.forbidden.message')),
          React.createElement('div', { className: 'flex items-center justify-center space-x-3 mt-6' },
            isLoggedIn
              ? React.createElement('button', { onClick: auth.logout, className: 'btn-primary' }, t('nav.signOut'))
              : React.createElement(Link, { to: '/login', className: 'btn-primary' }, t('auth.signIn'))
          )
        )
      );
    });
  }
}

export default withTranslation()(Forbidden);
