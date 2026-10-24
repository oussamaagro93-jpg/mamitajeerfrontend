import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { notify } from '../components/common/Toast';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = { form: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }, loading: false };
  }

  handleSubmit(e) {
    e.preventDefault();
    var t = this.props.t;
    if (this.state.form.password !== this.state.form.confirmPassword) {
      notify(t('auth.passwordsDoNotMatch'), 'error');
      return;
    }
    this.setState({ loading: true });
    var self = this;
    this.context.register({
      firstName: self.state.form.firstName,
      lastName: self.state.form.lastName,
      email: self.state.form.email,
      password: self.state.form.password,
    }).then(function () {
      // Account created: send the user to sign in with their email prefilled.
      self.props.history.push({
        pathname: '/login',
        state: { email: self.state.form.email, registered: true },
      });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('auth.registrationFailed');
      self.setState({ loading: false });
      notify(message, 'error');
    });
  }

  render() {
    var t = this.props.t;
    var form = this.state.form;
    return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 p-4' },
      React.createElement('div', { className: 'w-full max-w-md' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('div', { className: 'inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4' },
            React.createElement('span', { className: 'text-2xl font-bold text-white' }, t('app.logo'))
          ),
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, t('auth.createAccount')),
          React.createElement('p', { className: 'text-gray-500 dark:text-gray-400 mt-1' }, t('auth.getStarted'))
        ),
        React.createElement('div', { className: 'card p-8' },
          React.createElement('form', { onSubmit: this.handleSubmit.bind(this), className: 'space-y-4' },
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'label' }, t('auth.firstName')),
                React.createElement('input', { type: 'text', value: form.firstName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { firstName: e.target.value }) }); }.bind(this), className: 'input-field', placeholder: t('auth.firstNamePlaceholder'), required: true })
              ),
              React.createElement('div', null,
                React.createElement('label', { className: 'label' }, t('auth.lastName')),
                React.createElement('input', { type: 'text', value: form.lastName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { lastName: e.target.value }) }); }.bind(this), className: 'input-field', placeholder: t('auth.lastNamePlaceholder'), required: true })
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('auth.email')),
              React.createElement('input', { type: 'email', value: form.email, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { email: e.target.value }) }); }.bind(this), className: 'input-field', required: true })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('auth.password')),
              React.createElement('input', { type: 'password', value: form.password, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { password: e.target.value }) }); }.bind(this), className: 'input-field', minLength: 6, required: true })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('auth.confirmPassword')),
              React.createElement('input', { type: 'password', value: form.confirmPassword, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { confirmPassword: e.target.value }) }); }.bind(this), className: 'input-field', required: true })
            ),
            React.createElement('button', { type: 'submit', disabled: this.state.loading, className: 'btn-primary w-full' },
              this.state.loading ? t('auth.creatingAccount') : t('auth.createAccount')
            )
          ),
          React.createElement('p', { className: 'mt-6 text-center text-sm text-gray-500' },
            t('auth.alreadyHaveAccount'),
            React.createElement(Link, { to: '/login', className: 'text-primary-600 hover:text-primary-700 font-medium' }, t('auth.signIn'))
          )
        )
      )
    );
  }
}

Register.contextType = AuthContext;

export default withTranslation()(Register);
