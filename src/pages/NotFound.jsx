import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

class NotFound extends React.Component {
  render() {
    var t = this.props.t;
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center p-4' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('p', { className: 'text-6xl font-bold text-primary-600' }, t('errors.notFound.code')),
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white mt-4' }, t('errors.notFound.title')),
        React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-2' }, t('errors.notFound.message')),
        React.createElement(Link, { to: '/admin', className: 'btn-primary mt-6 inline-block' }, t('errors.backToDashboard'))
      )
    );
  }
}

export default withTranslation()(NotFound);
