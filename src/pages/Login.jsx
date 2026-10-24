import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { notify } from '../components/common/Toast';
import { MoonIcon, SunIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

class Login extends React.Component {
  constructor(props) {
    super(props);
    var routeState = props.location && props.location.state;
    this.state = {
      email: (routeState && routeState.email) || '',
      password: '',
      showPassword: false,
      loading: false,
      registered: !!(routeState && routeState.registered),
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true });
    var self = this;
    var t = this.props.t;
    this.context.login(self.state.email, self.state.password).then(function (res) {
      var role = res.data.user.role;
      if (['super_admin', 'admin', 'manager', 'employee'].includes(role)) {
        self.props.history.push('/admin');
      } else {
        self.props.history.push('/');
      }
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('auth.invalidCredentials');
      self.setState({ loading: false });
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    return React.createElement(AuthContext.Consumer, null, function (auth) {
      return React.createElement(ThemeContext.Consumer, null, function (theme) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 p-4' },
          React.createElement('button', { onClick: theme.toggleDarkMode, className: 'absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm' },
            theme.darkMode ? React.createElement(SunIcon, { className: 'w-5 h-5' }) : React.createElement(MoonIcon, { className: 'w-5 h-5' })
          ),
          React.createElement('div', { className: 'w-full max-w-md' },
            React.createElement('div', { className: 'text-center mb-8' },
              React.createElement('div', { className: 'inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4' },
                React.createElement('span', { className: 'text-2xl font-bold text-white' }, t('app.logo'))
              ),
              React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('auth.welcomeBack')),
              React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-1' }, t('auth.signInToAccount'))
            ),
            React.createElement('div', { className: 'card p-8' },
              this.state.registered && React.createElement('div', {
                className: 'mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700',
              }, t('auth.accountCreated')),
              React.createElement('form', { onSubmit: this.handleSubmit.bind(this), className: 'space-y-5' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('auth.email')),
                  React.createElement('input', { type: 'email', value: this.state.email, onChange: function (e) { this.setState({ email: e.target.value }); }.bind(this), className: 'input-field', placeholder: t('auth.emailPlaceholder'), required: true })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('auth.password')),
                  React.createElement('div', { className: 'relative' },
                    React.createElement('input', { type: this.state.showPassword ? 'text' : 'password', value: this.state.password, onChange: function (e) { this.setState({ password: e.target.value }); }.bind(this), className: 'input-field pr-10', placeholder: t('auth.passwordPlaceholder'), required: true }),
                    React.createElement('button', { type: 'button', onClick: function () { this.setState({ showPassword: !this.state.showPassword }); }.bind(this), className: 'absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' },
                      this.state.showPassword ? React.createElement(EyeSlashIcon, { className: 'w-5 h-5' }) : React.createElement(EyeIcon, { className: 'w-5 h-5' })
                    )
                  )
                ),
                React.createElement('div', { className: 'flex items-center justify-end' },
                  React.createElement(Link, { to: '/forgot-password', className: 'text-sm text-primary-600 hover:text-primary-700' }, t('auth.forgotPassword'))
                ),
                React.createElement('button', { type: 'submit', disabled: this.state.loading, className: 'btn-primary w-full' },
                  this.state.loading ? t('auth.signingIn') : t('auth.signIn')
                )
              ),
              React.createElement('p', { className: 'mt-6 text-center text-sm text-gray-500' },
                t('auth.dontHaveAccount'),
                React.createElement(Link, { to: '/register', className: 'text-primary-600 hover:text-primary-700 font-medium' }, t('auth.signUp'))
              )
            )
          )
        );
      }.bind(this));
    }.bind(this));
  }
}

Login.contextType = AuthContext;

export default withTranslation()(Login);
