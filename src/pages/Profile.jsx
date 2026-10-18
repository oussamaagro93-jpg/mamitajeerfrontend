import React from 'react';
import { withTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api';
import { notify } from '../components/common/Toast';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { firstName: '', lastName: '', email: '', phone: '' },
      passwordForm: { currentPassword: '', newPassword: '', confirmPassword: '' },
    };
  }

  componentDidMount() {
    if (this.context && this.context.user) {
      var u = this.context.user;
      this.setState({
        form: { firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', phone: u.phone || '' },
      });
    }
  }

  handleProfileSubmit(e) {
    e.preventDefault();
    var self = this;
    authAPI.updateProfile(self.state.form).then(function (res) {
      self.context.updateUser(res.data.data.user);
      notify(self.props.t('profile.profileUpdated'));
    }).catch(function () {});
  }

  handlePasswordSubmit(e) {
    e.preventDefault();
    if (this.state.passwordForm.newPassword !== this.state.passwordForm.confirmPassword) {
      notify(this.props.t('profile.passwordsDoNotMatch'), 'error');
      return;
    }
    var self = this;
    authAPI.updatePassword({ currentPassword: self.state.passwordForm.currentPassword, newPassword: self.state.passwordForm.newPassword }).then(function () {
      notify(self.props.t('profile.passwordUpdated'));
      self.setState({ passwordForm: { currentPassword: '', newPassword: '', confirmPassword: '' } });
    }).catch(function () {});
  }

  render() {
    var t = this.props.t;
    return React.createElement(AuthContext.Consumer, null, function (auth) {
      return React.createElement('div', { className: 'max-w-2xl mx-auto space-y-6' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('profile.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('profile.subtitle'))
        ),
        React.createElement('form', { onSubmit: this.handleProfileSubmit.bind(this), className: 'card p-6 space-y-4' },
          React.createElement('h2', { className: 'text-lg font-semibold' }, t('profile.personalInformation')),
          React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('profile.firstName')),
              React.createElement('input', { value: this.state.form.firstName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { firstName: e.target.value }) }); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('profile.lastName')),
              React.createElement('input', { value: this.state.form.lastName, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { lastName: e.target.value }) }); }.bind(this), className: 'input-field' })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('profile.email')),
            React.createElement('input', { type: 'email', value: this.state.form.email, onChange: function (e) { this.setState({ form: Object.assign({}, this.state.form, { email: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('button', { type: 'submit', className: 'btn-primary' }, t('profile.saveChanges'))
        ),
        React.createElement('form', { onSubmit: this.handlePasswordSubmit.bind(this), className: 'card p-6 space-y-4' },
          React.createElement('h2', { className: 'text-lg font-semibold' }, t('profile.changePassword')),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('profile.currentPassword')),
            React.createElement('input', { type: 'password', value: this.state.passwordForm.currentPassword, onChange: function (e) { this.setState({ passwordForm: Object.assign({}, this.state.passwordForm, { currentPassword: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('profile.newPassword')),
            React.createElement('input', { type: 'password', value: this.state.passwordForm.newPassword, onChange: function (e) { this.setState({ passwordForm: Object.assign({}, this.state.passwordForm, { newPassword: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('profile.confirmNewPassword')),
            React.createElement('input', { type: 'password', value: this.state.passwordForm.confirmPassword, onChange: function (e) { this.setState({ passwordForm: Object.assign({}, this.state.passwordForm, { confirmPassword: e.target.value }) }); }.bind(this), className: 'input-field' })
          ),
          React.createElement('button', { type: 'submit', className: 'btn-primary' }, t('profile.updatePassword'))
        )
      );
    }.bind(this));
  }
}

Profile.contextType = AuthContext;

export default withTranslation()(Profile);
