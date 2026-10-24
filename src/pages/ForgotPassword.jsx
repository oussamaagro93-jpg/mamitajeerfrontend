import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { authAPI } from '../api';
import { notify } from '../components/common/Toast';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', sent: false, loading: false };
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true });
    var self = this;
    authAPI.forgotPassword(this.state.email).then(function () {
      self.setState({ sent: true, loading: false });
      notify(self.props.t('auth.resetLinkSent'));
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || self.props.t('auth.requestFailed');
      self.setState({ loading: false });
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 p-4' },
      React.createElement('div', { className: 'w-full max-w-md' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('auth.forgotPassword')),
          React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-1' }, t('auth.wellSendResetLink'))
        ),
        React.createElement('div', { className: 'card p-8' },
          this.state.sent
            ? React.createElement('div', { className: 'text-center' },
                React.createElement('p', { className: 'text-gray-600 dark:text-gray-400' }, t('auth.checkEmailForReset')),
                React.createElement(Link, { to: '/login', className: 'btn-primary mt-4 inline-block' }, t('auth.backToLogin'))
              )
            : React.createElement('form', { onSubmit: this.handleSubmit.bind(this), className: 'space-y-4' },
                React.createElement('div', null,
                  React.createElement('label', { className: 'label' }, t('auth.email')),
                  React.createElement('input', { type: 'email', value: this.state.email, onChange: function (e) { this.setState({ email: e.target.value }); }.bind(this), className: 'input-field', required: true })
                ),
                React.createElement('button', { type: 'submit', disabled: this.state.loading, className: 'btn-primary w-full' },
                  this.state.loading ? t('auth.sending') : t('auth.sendResetLink')
                ),
                React.createElement('p', { className: 'text-center text-sm text-gray-500' },
                  React.createElement(Link, { to: '/login', className: 'text-primary-600 hover:text-primary-700' }, t('auth.backToLogin'))
                )
              )
        )
      )
    );
  }
}

export default withTranslation()(ForgotPassword);
