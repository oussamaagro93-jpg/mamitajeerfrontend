import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { authAPI } from '../api';
import { notify } from '../components/common/Toast';

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = { password: '', confirmPassword: '', loading: false, done: false };
  }

  handleSubmit(e) {
    e.preventDefault();
    var t = this.props.t;
    var self = this;
    if (this.state.password.length < 6) {
      notify(t('auth.passwordTooShort'), 'error');
      return;
    }
    if (this.state.password !== this.state.confirmPassword) {
      notify(t('auth.passwordsDoNotMatch'), 'error');
      return;
    }

    this.setState({ loading: true });
    authAPI.resetPassword(this.props.match.params.token, this.state.password).then(function () {
      self.setState({ loading: false, done: true });
      notify(t('auth.resetSuccess'));
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('auth.invalidResetToken');
      self.setState({ loading: false });
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 p-4' },
      React.createElement('div', { className: 'w-full max-w-md' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('auth.resetPasswordTitle')),
          React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-1' }, t('auth.resetPasswordSubtitle'))
        ),
        React.createElement('div', { className: 'card p-8' },
          this.state.done
            ? React.createElement('div', { className: 'text-center space-y-4' },
                React.createElement('p', { className: 'text-gray-600 dark:text-gray-400' }, t('auth.resetSuccess')),
                React.createElement(Link, { to: '/login', className: 'btn-primary inline-block' }, t('auth.backToLogin'))
              )
            : React.createElement('form', { onSubmit: this.handleSubmit.bind(this), className: 'space-y-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('auth.newPassword')),
                  React.createElement('input', {
                    type: 'password',
                    value: this.state.password,
                    onChange: function (e) { this.setState({ password: e.target.value }); }.bind(this),
                    className: 'input-field',
                    required: true,
                    minLength: 6,
                  })
                ),
                React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('auth.confirmPassword')),
                  React.createElement('input', {
                    type: 'password',
                    value: this.state.confirmPassword,
                    onChange: function (e) { this.setState({ confirmPassword: e.target.value }); }.bind(this),
                    className: 'input-field',
                    required: true,
                    minLength: 6,
                  })
                ),
                React.createElement('button', { type: 'submit', disabled: this.state.loading, className: 'btn-primary w-full' },
                  this.state.loading ? t('auth.resetting') : t('auth.resetPasswordButton')
                ),
                React.createElement('div', { className: 'text-center' },
                  React.createElement(Link, { to: '/login', className: 'text-sm text-primary-600 hover:text-primary-700' }, t('auth.backToLogin'))
                )
              )
        )
      )
    );
  }
}

export default withTranslation()(ResetPassword);
