import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Bars3Icon, MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = { menuOpen: false };
  }

  render() {
    var t = this.props.t;
    return React.createElement(AuthContext.Consumer, null, function (auth) {
      return React.createElement(ThemeContext.Consumer, null, function (theme) {
        return React.createElement('header', { className: 'sticky top-0 z-30 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700' },
          React.createElement('div', { className: 'flex items-center justify-between h-16 px-4 md:px-6' },
            React.createElement('button', { type: 'button', className: 'lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300', onClick: this.props.onMenuClick },
              React.createElement(Bars3Icon, { className: 'w-6 h-6' })
            ),
            React.createElement('div', { className: 'flex-1' }),
            React.createElement('div', { className: 'flex items-center space-x-3' },
              React.createElement(LanguageSwitcher, null),
              React.createElement('button', { onClick: theme.toggleDarkMode, className: 'p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' },
                theme.darkMode ? React.createElement(SunIcon, { className: 'w-5 h-5' }) : React.createElement(MoonIcon, { className: 'w-5 h-5' })
              ),
              React.createElement('div', { className: 'relative' },
                React.createElement('button', { onClick: function () { this.setState({ menuOpen: !this.state.menuOpen }); }.bind(this), className: 'flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' },
                  React.createElement(UserCircleIcon, { className: 'w-8 h-8 text-gray-400' }),
                  React.createElement('span', { className: 'hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300' },
                    (auth.user ? auth.user.firstName + ' ' + auth.user.lastName : '')
                  )
                ),
                this.state.menuOpen ? React.createElement(React.Fragment, null,
                  React.createElement('div', { className: 'fixed inset-0 z-40', onClick: function () { this.setState({ menuOpen: false }); }.bind(this) }),
                  React.createElement('div', { className: 'absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50' },
                    React.createElement(Link, { to: '/admin/profile', className: 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700', onClick: function () { this.setState({ menuOpen: false }); }.bind(this) }, t('nav.profile')),
                    React.createElement(Link, { to: '/admin/settings', className: 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700', onClick: function () { this.setState({ menuOpen: false }); }.bind(this) }, t('nav.settings')),
                    React.createElement('div', { className: 'border-t border-gray-200 dark:border-gray-700' }),
                    React.createElement('button', { onClick: function () { auth.logout(); this.setState({ menuOpen: false }); }.bind(this), className: 'block w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-gray-100 dark:hover:bg-gray-700' }, t('nav.signOut'))
                  )
                ) : null
              )
            )
          )
        );
      }.bind(this));
    }.bind(this));
  }
}

export default withTranslation()(Header);
