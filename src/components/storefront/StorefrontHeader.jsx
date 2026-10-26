import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Bars3Icon, MagnifyingGlassIcon, GlobeAltIcon, ShoppingBagIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { LANGUAGES, languageSlice } from '../../store/languageSlice';
import CartContext from '../../context/CartContext';

class StorefrontHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { langOpen: false };
  }

  handleLanguageChange(code) {
    this.props.dispatch(languageSlice.setLanguage(code));
    this.setState({ langOpen: false });
  }

  render() {
    var t = this.props.t;
    var currentLang = this.props.language;
    var onMenuToggle = this.props.onMenuToggle || function () {};
    var onSearchToggle = this.props.onSearchToggle || function () {};
    var showMenu = this.props.showMenu !== false;

    return React.createElement('header', {
      className: 'sticky top-0 z-40 bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] shadow-lg shadow-purple-900/20 border-b border-white/10',
    },
      React.createElement('div', { className: 'flex items-center justify-between gap-3 px-4 sm:px-6 py-3 max-w-7xl mx-auto' },

        showMenu
          ? React.createElement('button', {
              onClick: onMenuToggle,
              className: 'p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95',
              'aria-label': t('storefront.header.menu'),
            },
              React.createElement(Bars3Icon, { className: 'w-6 h-6' })
            )
          : null,

        React.createElement('div', {
          onClick: this.props.onLogoClick || function () { window.location.href = '/'; },
          className: 'flex items-center gap-2 cursor-pointer min-w-0 group',
        },
          React.createElement('div', {
            className: 'w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md shadow-purple-950/20 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105',
          },
            React.createElement('span', { className: 'text-sm font-bold text-[#6C3DF2]' }, t('app.logo'))
          ),
          React.createElement('span', { className: 'text-lg font-bold text-white truncate' }, t('app.name'))
        ),

        React.createElement('div', { className: 'flex items-center space-x-1' },
          // Category browser
          React.createElement('a', {
            href: '/categories',
            className: 'p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95',
            'aria-label': t('shop.categoriesTitle'),
          },
            React.createElement(Squares2X2Icon, { className: 'w-6 h-6' })
          ),

          // Shopping cart
          this.props.showCart !== false && React.createElement('a', {
            href: '/cart',
            className: 'relative p-2 text-white hover:bg-white/10 rounded-full transition-colors active:scale-95',
            'aria-label': t('cart.title'),
          },
            React.createElement(ShoppingBagIcon, { className: 'w-6 h-6' }),
            this.context && this.context.itemCount > 0 && React.createElement('span', {
              className: 'absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-white text-[#6C3DF2] text-[10px] font-extrabold flex items-center justify-center shadow-md',
            }, this.context.itemCount > 99 ? '99+' : this.context.itemCount)
          ),

          // Language Switcher
          React.createElement('div', { className: 'relative' },
            React.createElement('button', {
              onClick: function () { this.setState({ langOpen: !this.state.langOpen }); }.bind(this),
              className: 'p-2 text-white hover:bg-white/10 rounded-full transition-colors',
              'aria-label': t('storefront.header.language'),
            },
              React.createElement(GlobeAltIcon, { className: 'w-6 h-6' })
            ),
            this.state.langOpen && React.createElement('div', {
              className: 'absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[140px] z-50',
            },
              LANGUAGES.map(function (lang) {
                return React.createElement('button', {
                  key: lang.code,
                  onClick: function () { this.handleLanguageChange(lang.code); }.bind(this),
                  className: 'w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 ' + (currentLang === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'),
                },
                  React.createElement('span', { className: 'text-base' }, lang.code === 'ar' ? '\u0639' : lang.code === 'fr' ? 'F' : 'E'),
                  React.createElement('span', null, lang.label)
                );
              }.bind(this))
            )
          ),

          React.createElement('button', {
            onClick: onSearchToggle,
            className: 'p-2 text-white hover:bg-white/10 rounded-full transition-colors',
            'aria-label': t('storefront.header.search'),
          },
            React.createElement(MagnifyingGlassIcon, { className: 'w-6 h-6' })
          )
        )
      )
    );
  }
}

function mapStateToProps(state) {
  return { language: state.language.code };
}

StorefrontHeader.contextType = CartContext;

var ConnectedHeader = connect(mapStateToProps)(StorefrontHeader);
export default withTranslation()(ConnectedHeader);
