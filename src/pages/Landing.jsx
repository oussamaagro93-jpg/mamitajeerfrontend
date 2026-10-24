import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LANGUAGES, languageSlice } from '../store/languageSlice';
import { store } from '../store';
import { productAPI } from '../api';
import {
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

var BRAND_COLOR = '#6C3DF2';

class Landing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      langOpen: false,
      menuOpen: false,
      featuredProducts: [],
      loadingProducts: true,
    };
  }

  componentDidMount() {
    this.fetchFeaturedProducts();
  }

  fetchFeaturedProducts() {
    var self = this;
    productAPI
      .getAll({ isFeatured: true, status: 'published', limit: 4 })
      .then(function (res) {
        var products = (res.data.data.products || []).slice(0, 4);
        self.setState({ featuredProducts: products, loadingProducts: false });
      })
      .catch(function () {
        self.setState({ loadingProducts: false });
      });
  }

  handleGetStarted(e) {
    e.preventDefault();
    if (this.state.email) {
      try {
        sessionStorage.setItem('signupEmail', this.state.email);
      } catch (err) {}
    }
    this.props.history.push('/register');
  }

  render() {
    var t = this.props.t;
    var lang = this.props.language;
    var products = this.state.featuredProducts;
    var user = this.context ? this.context.user : null;

    return React.createElement(ThemeContext.Consumer, null, function (theme) {
      return React.createElement('div', { className: 'min-h-screen bg-white dark:bg-gray-900 transition-colors' },

        // Mobile Menu Overlay
        this.state.menuOpen &&
          React.createElement('div', {
            className: 'fixed inset-0 z-50 bg-black/50',
            onClick: function () {
              this.setState({ menuOpen: false });
            }.bind(this),
          }),

        // Mobile Menu Drawer
        React.createElement(
          'div',
          {
            className:
              'fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-800 z-50 shadow-2xl transform transition-transform duration-300 ' +
              (this.state.menuOpen ? 'translate-x-0' : '-translate-x-full'),
          },
          React.createElement(
            'div',
            { className: 'p-6' },
            React.createElement(
              'div',
              { className: 'flex items-center justify-between mb-8' },
              React.createElement(
                'div',
                { className: 'flex items-center space-x-2' },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  React.createElement(
                    'span',
                    { className: 'text-sm font-bold text-white' },
                    t('app.logo')
                  )
                ),
                React.createElement(
                  'span',
                  { className: 'text-lg font-bold text-gray-900 dark:text-white' },
                  t('app.name')
                )
              ),
              React.createElement(
                'button',
                {
                  onClick: function () {
                    this.setState({ menuOpen: false });
                  }.bind(this),
                  className: 'p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                },
                React.createElement('span', { className: 'text-2xl' }, '\u00D7')
              )
            ),
            React.createElement(
              'nav',
              { className: 'space-y-2' },
              React.createElement(
                'a',
                {
                  href: '#features',
                  className:
                    'block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors',
                  onClick: function () {
                    this.setState({ menuOpen: false });
                  }.bind(this),
                },
                t('nav.features')
              ),
              React.createElement(
                'a',
                {
                  href: '#pricing',
                  className:
                    'block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors',
                  onClick: function () {
                    this.setState({ menuOpen: false });
                  }.bind(this),
                },
                t('nav.pricing')
              ),
              React.createElement('hr', {
                className: 'border-gray-200 dark:border-gray-700 my-2',
              }),
              React.createElement(
                'p',
                {
                  className:
                    'px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider',
                },
                t('storefront.header.language')
              ),
              LANGUAGES.map(function (lang) {
                return React.createElement(
                  'button',
                  {
                    key: lang.code,
                    onClick: function () {
                      store.dispatch(languageSlice.setLanguage(lang.code));
                      this.setState({ menuOpen: false });
                    }.bind(this),
                    className:
                      'block w-full text-left px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors',
                  },
                  lang.label
                );
              }.bind(this))
            )
          )
        ),

        // Header
        React.createElement(
          'header',
          {
            className:
              'sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800',
          },
          React.createElement(
            'div',
            {
              className:
                'flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto',
            },
            // Logo
            React.createElement(
              'div',
              {
                className: 'flex items-center space-x-2 cursor-pointer',
                onClick: function () {
                  window.location.href = '/';
                },
              },
              React.createElement(
                'div',
                {
                  className:
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                  style: { backgroundColor: BRAND_COLOR },
                },
                React.createElement(
                  'span',
                  { className: 'text-sm font-bold text-white' },
                  t('app.logo')
                )
              ),
              React.createElement(
                'span',
                {
                  className:
                    'text-lg font-bold text-gray-900 dark:text-white',
                },
                t('app.name')
              )
            ),

            // Desktop Nav Links
            React.createElement(
              'div',
              { className: 'hidden md:flex items-center space-x-8' },
              React.createElement(
                'a',
                {
                  href: '#features',
                  className:
                    'text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
                },
                t('nav.features')
              ),
              React.createElement(
                'a',
                {
                  href: '#pricing',
                  className:
                    'text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
                },
                t('nav.pricing')
              )
            ),

            // Right actions
            React.createElement(
              'div',
              { className: 'flex items-center space-x-2' },
              // Theme Toggle
              React.createElement(
                'button',
                {
                  onClick: theme.toggleDarkMode,
                  className:
                    'p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                },
                theme.darkMode
                  ? React.createElement(SunIcon, { className: 'w-5 h-5' })
                  : React.createElement(MoonIcon, { className: 'w-5 h-5' })
              ),

              // Language Switcher
              React.createElement(
                'div',
                { className: 'relative hidden sm:block' },
                React.createElement(
                  'button',
                  {
                    onClick: function () {
                      this.setState({
                        langOpen: !this.state.langOpen,
                      });
                    }.bind(this),
                    className:
                      'p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                  },
                  React.createElement(GlobeAltIcon, {
                    className: 'w-5 h-5',
                  })
                ),
                this.state.langOpen &&
                  React.createElement(
                    'div',
                    {
                      className:
                        'absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[140px] z-50',
                    },
                    LANGUAGES.map(function (l) {
                      return React.createElement(
                        'button',
                        {
                          key: l.code,
                          onClick: function () {
                            store.dispatch(
                              languageSlice.setLanguage(l.code)
                            );
                            this.setState({ langOpen: false });
                          }.bind(this),
                          className:
                            'w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ' +
                            (lang === l.code
                              ? 'text-primary-600 font-medium'
                              : 'text-gray-700 dark:text-gray-300'),
                        },
                        React.createElement(
                          'span',
                          null,
                          l.label
                        )
                      );
                    }.bind(this))
                  )
              ),

              // Signed-in customers see Sign Out instead of Sign In / Get Started
              user
                ? React.createElement(
                    'button',
                    {
                      onClick: function () {
                        if (this.context) this.context.logout();
                      }.bind(this),
                      className:
                        'hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
                    },
                    t('nav.signOut')
                  )
                : React.createElement(
                    Link,
                    {
                      to: '/login',
                      className:
                        'hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
                    },
                    t('auth.signIn')
                  ),

              !user &&
                React.createElement(
                  Link,
                  {
                    to: '/register',
                    className:
                      'inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  t('landing.hero.getStarted')
                ),

              // Mobile hamburger
              React.createElement(
                'button',
                {
                  onClick: function () {
                    this.setState({
                      menuOpen: !this.state.menuOpen,
                    });
                  }.bind(this),
                  className:
                    'md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                },
                React.createElement(
                  'svg',
                  {
                    className: 'w-6 h-6',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                  },
                  React.createElement('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeWidth: 2,
                    d: 'M4 6h16M4 12h16M4 18h16',
                  })
                )
              )
            )
          )
        ),

        // Hero Section
        React.createElement(
          'section',
          {
            className:
              'relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8',
          },
          // Background decoration
          React.createElement('div', {
            className:
              'absolute inset-0 -z-10',
            style: {
              background:
                'linear-gradient(135deg, rgba(108,61,242,0.05) 0%, rgba(255,255,255,0) 50%, rgba(108,61,242,0.03) 100%)',
            },
          }),
          React.createElement(
            'div',
            { className: 'max-w-7xl mx-auto' },
            React.createElement(
              'div',
              { className: 'text-center max-w-3xl mx-auto' },
              React.createElement(
                'h1',
                {
                  className:
                    'text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight',
                },
                t('landing.hero.title')
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed',
                },
                t('landing.hero.subtitle')
              ),
              React.createElement(
                'form',
                {
                  onSubmit: this.handleGetStarted.bind(this),
                  className:
                    'mt-10 max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3',
                },
                React.createElement('input', {
                  type: 'email',
                  value: this.state.email,
                  onChange: function (e) {
                    this.setState({ email: e.target.value });
                  }.bind(this),
                  placeholder: t('landing.cta.placeholder'),
                  className:
                    'w-full sm:flex-1 px-5 py-3.5 text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors',
                  style: {
                    borderColor: this.state.email
                      ? BRAND_COLOR
                      : undefined,
                  },
                  required: true,
                }),
                React.createElement(
                  'button',
                  {
                    type: 'submit',
                    className:
                      'w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-100 whitespace-nowrap',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  t('landing.cta.button')
                )
              )
            )
          )
        ),

        // Stats Bar
        React.createElement(
          'section',
          { className: 'py-12 bg-gray-50 dark:bg-gray-800/50' },
          React.createElement(
            'div',
            {
              className:
                'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center',
            },
            React.createElement(
              'div',
              null,
              React.createElement(
                'p',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold',
                  style: { color: BRAND_COLOR },
                },
                '10,000+'
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-1 text-sm text-gray-500 dark:text-gray-400',
                },
                t('landing.stats.orders')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'p',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold',
                  style: { color: BRAND_COLOR },
                },
                '500+'
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-1 text-sm text-gray-500 dark:text-gray-400',
                },
                t('landing.stats.stores')
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'p',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold',
                  style: { color: BRAND_COLOR },
                },
                '50,000+'
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-1 text-sm text-gray-500 dark:text-gray-400',
                },
                t('landing.stats.customers')
              )
            )
          )
        ),

        // Features Section
        React.createElement(
          'section',
          { id: 'features', className: 'py-20 px-4 sm:px-6 lg:px-8' },
          React.createElement(
            'div',
            { className: 'max-w-7xl mx-auto' },
            React.createElement(
              'div',
              { className: 'text-center mb-16' },
              React.createElement(
                'h2',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white',
                },
                t('landing.features.title')
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto',
                },
                t('landing.features.subtitle')
              )
            ),
            React.createElement(
              'div',
              {
                className:
                  'grid grid-cols-1 md:grid-cols-3 gap-8',
              },
              // Feature 1
              React.createElement(
                'div',
                {
                  className:
                    'group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1',
                },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
                    style: { backgroundColor: BRAND_COLOR + '15' },
                  },
                  React.createElement(
                    'svg',
                    {
                      className: 'w-7 h-7',
                      fill: 'none',
                      stroke: BRAND_COLOR,
                      strokeWidth: 2,
                      viewBox: '0 0 24 24',
                    },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
                    })
                  )
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.features.products.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed',
                  },
                  t('landing.features.products.description')
                )
              ),
              // Feature 2
              React.createElement(
                'div',
                {
                  className:
                    'group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1',
                },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
                    style: { backgroundColor: BRAND_COLOR + '15' },
                  },
                  React.createElement(
                    'svg',
                    {
                      className: 'w-7 h-7',
                      fill: 'none',
                      stroke: BRAND_COLOR,
                      strokeWidth: 2,
                      viewBox: '0 0 24 24',
                    },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M13 10V3L4 14h7v7l9-11h-7z',
                    })
                  )
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.features.shipping.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed',
                  },
                  t('landing.features.shipping.description')
                )
              ),
              // Feature 3
              React.createElement(
                'div',
                {
                  className:
                    'group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1',
                },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-14 h-14 rounded-xl flex items-center justify-center mb-5',
                    style: { backgroundColor: BRAND_COLOR + '15' },
                  },
                  React.createElement(
                    'svg',
                    {
                      className: 'w-7 h-7',
                      fill: 'none',
                      stroke: BRAND_COLOR,
                      strokeWidth: 2,
                      viewBox: '0 0 24 24',
                    },
                    React.createElement('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                    })
                  )
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.features.secure.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed',
                  },
                  t('landing.features.secure.description')
                )
              )
            )
          )
        ),

        // How It Works
        React.createElement(
          'section',
          {
            className:
              'py-20 px-4 sm:px-6 lg:px-8',
            style: { backgroundColor: BRAND_COLOR + '08' },
          },
          React.createElement(
            'div',
            { className: 'max-w-5xl mx-auto' },
            React.createElement(
              'div',
              { className: 'text-center mb-16' },
              React.createElement(
                'h2',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white',
                },
                t('landing.howItWorks.title')
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-4 text-lg text-gray-500 dark:text-gray-400',
                },
                t('landing.howItWorks.subtitle')
              )
            ),
            React.createElement(
              'div',
              {
                className:
                  'grid grid-cols-1 md:grid-cols-3 gap-8',
              },
              // Step 1
              React.createElement(
                'div',
                { className: 'text-center' },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  '1'
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.howItWorks.step1.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto',
                  },
                  t('landing.howItWorks.step1.description')
                )
              ),
              // Step 2
              React.createElement(
                'div',
                { className: 'text-center' },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  '2'
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.howItWorks.step2.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto',
                  },
                  t('landing.howItWorks.step2.description')
                )
              ),
              // Step 3
              React.createElement(
                'div',
                { className: 'text-center' },
                React.createElement(
                  'div',
                  {
                    className:
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  '3'
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-3',
                  },
                  t('landing.howItWorks.step3.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto',
                  },
                  t('landing.howItWorks.step3.description')
                )
              )
            )
          )
        ),

        // Featured Products
        !this.state.loadingProducts &&
          products.length > 0 &&
          React.createElement(
            'section',
            { className: 'py-20 px-4 sm:px-6 lg:px-8' },
            React.createElement(
              'div',
              { className: 'max-w-7xl mx-auto' },
              React.createElement(
                'div',
                { className: 'text-center mb-12' },
                React.createElement(
                  'h2',
                  {
                    className:
                      'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white',
                  },
                  t('landing.products.title')
                ),
                React.createElement(
                  'p',
                  {
                    className:
                      'mt-4 text-lg text-gray-500 dark:text-gray-400',
                  },
                  t('landing.products.subtitle')
                )
              ),
              React.createElement(
                'div',
                {
                  className:
                    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
                },
                products.map(function (p) {
                  var img =
                    p.image ||
                    (p.images && p.images.length > 0
                      ? p.images[0].url
                      : null);
                  return React.createElement(
                    Link,
                    {
                      key: p.id,
                      to: '/products/' + p.slug,
                      className:
                        'group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1',
                    },
                    React.createElement(
                      'div',
                      {
                        className:
                          'aspect-square bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden',
                      },
                      img
                        ? React.createElement('img', {
                            src: img,
                            alt: p.name,
                            className:
                              'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                          })
                        : React.createElement(
                            'div',
                            {
                              className:
                                'w-16 h-16 rounded-full',
                              style: {
                                backgroundColor: BRAND_COLOR + '30',
                              },
                            }
                          )
                    ),
                    React.createElement(
                      'div',
                      { className: 'p-4' },
                      React.createElement(
                        'h3',
                        {
                          className:
                            'font-semibold text-gray-900 dark:text-white text-sm truncate',
                        },
                        p.name
                      ),
                      React.createElement(
                        'p',
                        {
                          className:
                            'text-sm font-bold mt-1',
                          style: { color: BRAND_COLOR },
                        },
                        parseFloat(p.price).toFixed(2) + ' DA'
                      )
                    )
                  );
                })
              ),
              React.createElement(
                'div',
                { className: 'text-center mt-10' },
                React.createElement(
                  Link,
                  {
                    to: '/register',
                    className:
                      'inline-flex items-center px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  t('landing.products.viewAll'),
                  React.createElement(ChevronRightIcon, {
                    className: 'w-4 h-4 ml-1',
                  })
                )
              )
            )
          ),

        // Pricing Section
        React.createElement(
          'section',
          {
            id: 'pricing',
            className:
              'py-20 px-4 sm:px-6 lg:px-8',
            style: { backgroundColor: BRAND_COLOR + '08' },
          },
          React.createElement(
            'div',
            { className: 'max-w-6xl mx-auto' },
            React.createElement(
              'div',
              { className: 'text-center mb-16' },
              React.createElement(
                'h2',
                {
                  className:
                    'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white',
                },
                t('landing.pricing.title')
              ),
              React.createElement(
                'p',
                {
                  className:
                    'mt-4 text-lg text-gray-500 dark:text-gray-400',
                },
                t('landing.pricing.subtitle')
              )
            ),
            React.createElement(
              'div',
              {
                className:
                  'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto',
              },
              // Free / Trial
              React.createElement(
                'div',
                {
                  className:
                    'relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all',
                },
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-2',
                  },
                  t('landing.pricing.free.title')
                ),
                React.createElement(
                  'div',
                  { className: 'flex items-baseline mb-6' },
                  React.createElement(
                    'span',
                    {
                      className:
                        'text-4xl font-extrabold text-gray-900 dark:text-white',
                    },
                    t('landing.pricing.free.price')
                  ),
                  React.createElement(
                    'span',
                    {
                      className:
                        'ml-2 text-gray-500 dark:text-gray-400 text-sm',
                    },
                    t('landing.pricing.free.period')
                  )
                ),
                React.createElement(
                  'ul',
                  { className: 'space-y-3 mb-8' },
                  t('landing.pricing.free.features', {
                    returnObjects: true,
                  }).map(function (f, i) {
                    return React.createElement(
                      'li',
                      {
                        key: i,
                        className:
                          'flex items-start text-sm text-gray-600 dark:text-gray-400',
                      },
                      React.createElement(CheckIcon, {
                        className: 'w-4 h-4 mr-2 mt-0.5 flex-shrink-0',
                        style: { color: BRAND_COLOR },
                      }),
                      f
                    );
                  })
                ),
                React.createElement(
                  Link,
                  {
                    to: '/register',
                    className:
                      'block w-full text-center py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-md',
                    style: {
                      borderColor: BRAND_COLOR,
                      color: BRAND_COLOR,
                    },
                  },
                  t('landing.pricing.free.cta')
                )
              ),
              // Pro (Recommended)
              React.createElement(
                'div',
                {
                  className:
                    'relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-2 transition-all hover:shadow-2xl scale-105',
                  style: { borderColor: BRAND_COLOR },
                },
                React.createElement(
                  'div',
                  {
                    className:
                      'absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  'POPULAR'
                ),
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-2',
                  },
                  t('landing.pricing.pro.title')
                ),
                React.createElement(
                  'div',
                  { className: 'flex items-baseline mb-6' },
                  React.createElement(
                    'span',
                    {
                      className:
                        'text-4xl font-extrabold text-gray-900 dark:text-white',
                    },
                    t('landing.pricing.pro.price')
                  ),
                  React.createElement(
                    'span',
                    {
                      className:
                        'ml-2 text-gray-500 dark:text-gray-400 text-sm',
                    },
                    t('landing.pricing.pro.period')
                  )
                ),
                React.createElement(
                  'ul',
                  { className: 'space-y-3 mb-8' },
                  t('landing.pricing.pro.features', {
                    returnObjects: true,
                  }).map(function (f, i) {
                    return React.createElement(
                      'li',
                      {
                        key: i,
                        className:
                          'flex items-start text-sm text-gray-600 dark:text-gray-400',
                      },
                      React.createElement(CheckIcon, {
                        className: 'w-4 h-4 mr-2 mt-0.5 flex-shrink-0',
                        style: { color: BRAND_COLOR },
                      }),
                      f
                    );
                  })
                ),
                React.createElement(
                  Link,
                  {
                    to: '/register',
                    className:
                      'block w-full text-center py-3 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg',
                    style: { backgroundColor: BRAND_COLOR },
                  },
                  t('landing.pricing.pro.cta')
                )
              ),
              // Enterprise
              React.createElement(
                'div',
                {
                  className:
                    'relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all',
                },
                React.createElement(
                  'h3',
                  {
                    className:
                      'text-xl font-bold text-gray-900 dark:text-white mb-2',
                  },
                  t('landing.pricing.enterprise.title')
                ),
                React.createElement(
                  'div',
                  { className: 'flex items-baseline mb-6' },
                  React.createElement(
                    'span',
                    {
                      className:
                        'text-4xl font-extrabold text-gray-900 dark:text-white',
                    },
                    t('landing.pricing.enterprise.price')
                  )
                ),
                React.createElement(
                  'ul',
                  { className: 'space-y-3 mb-8' },
                  t('landing.pricing.enterprise.features', {
                    returnObjects: true,
                  }).map(function (f, i) {
                    return React.createElement(
                      'li',
                      {
                        key: i,
                        className:
                          'flex items-start text-sm text-gray-600 dark:text-gray-400',
                      },
                      React.createElement(CheckIcon, {
                        className: 'w-4 h-4 mr-2 mt-0.5 flex-shrink-0',
                        style: { color: BRAND_COLOR },
                      }),
                      f
                    );
                  })
                ),
                React.createElement(
                  Link,
                  {
                    to: '/register',
                    className:
                      'block w-full text-center py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:shadow-md',
                    style: {
                      borderColor: BRAND_COLOR,
                      color: BRAND_COLOR,
                    },
                  },
                  t('landing.pricing.enterprise.cta')
                )
              )
            )
          )
        ),

        // Bottom CTA
        React.createElement(
          'section',
          {
            className:
              'py-20 px-4 sm:px-6 lg:px-8 text-white',
            style: {
              background:
                'linear-gradient(135deg, ' +
                BRAND_COLOR +
                ' 0%, #5B21B6 100%)',
            },
          },
          React.createElement(
            'div',
            {
              className:
                'max-w-3xl mx-auto text-center',
            },
            React.createElement(
              'h2',
              {
                className:
                  'text-3xl sm:text-4xl font-bold leading-tight',
              },
              t('landing.cta.title')
            ),
            React.createElement(
              'p',
              {
                className:
                  'mt-4 text-lg text-white/80 max-w-2xl mx-auto',
              },
              t('landing.cta.subtitle')
            ),
            React.createElement(
              'form',
              {
                onSubmit: this.handleGetStarted.bind(this),
                className:
                  'mt-10 max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3',
              },
              React.createElement('input', {
                type: 'email',
                value: this.state.email,
                onChange: function (e) {
                  this.setState({ email: e.target.value });
                }.bind(this),
                placeholder: t('landing.cta.placeholder'),
                className:
                  'w-full sm:flex-1 px-5 py-3.5 text-base rounded-xl border-2 border-white/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors',
                required: true,
              }),
              React.createElement(
                'button',
                {
                  type: 'submit',
                  className:
                    'w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-900 bg-white rounded-xl transition-all hover:shadow-xl hover:scale-105 active:scale-100 whitespace-nowrap',
                },
                t('landing.cta.button')
              )
            )
          )
        ),

        // Footer
        React.createElement(
          'footer',
          {
            className:
              'py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400',
          },
          React.createElement(
            'div',
            {
              className:
                'max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6',
            },
            React.createElement(
              'div',
              { className: 'flex items-center space-x-2' },
              React.createElement(
                'div',
                {
                  className:
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                  style: { backgroundColor: BRAND_COLOR },
                },
                React.createElement(
                  'span',
                  { className: 'text-xs font-bold text-white' },
                  t('app.logo')
                )
              ),
              React.createElement(
                'span',
                { className: 'text-sm font-bold text-white' },
                t('app.name')
              )
            ),
            React.createElement(
              'div',
              { className: 'flex items-center space-x-6 text-sm' },
              React.createElement(
                'a',
                { href: '#', className: 'hover:text-white transition-colors' },
                'Privacy Policy'
              ),
              React.createElement(
                'a',
                { href: '#', className: 'hover:text-white transition-colors' },
                'Terms of Service'
              ),
              React.createElement(
                'a',
                { href: '#', className: 'hover:text-white transition-colors' },
                'Contact Us'
              )
            ),
            React.createElement(
              'p',
              { className: 'text-xs' },
              '\u00A9 ' +
                new Date().getFullYear() +
                ' ' +
                t('app.name') +
                '. ' +
                t('landing.footer.rights')
            )
          )
        )
      );
    }.bind(this));
  }
}

function mapStateToProps(state) {
  return { language: state.language.code };
}

Landing.contextType = AuthContext;

export default connect(mapStateToProps)(withTranslation()(Landing));