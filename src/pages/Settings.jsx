import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../i18n';
import { getDirection } from '../utils/direction';
import { ThemeContext } from '../context/ThemeContext';
import { LANGUAGES } from '../store/languageSlice';
import { storeProfileAPI } from '../api';
import { notify } from '../components/common/Toast';

function emptyStore() {
  return {
    name: '',
    logo: '',
    email: '',
    phone: '',
    phone2: '',
    whatsapp: '',
    address: '',
    facebook: '',
    instagram: '',
    x: '',
  };
}

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      store: emptyStore(),
      storeLoading: true,
      savingStore: false,
    };
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.handleSaveStore = this.handleSaveStore.bind(this);
  }

  componentDidMount() {
    var self = this;
    storeProfileAPI.get().then(function (res) {
      var store = res.data.data.store;
      if (store) {
        self.setState({
          store: {
            name: store.name || '',
            logo: store.logo || '',
            email: store.email || '',
            phone: store.phone || '',
            phone2: store.phone2 || '',
            whatsapp: store.whatsapp || '',
            address: store.address || '',
            facebook: store.facebook || '',
            instagram: store.instagram || '',
            x: store.x || '',
          },
          storeLoading: false,
        });
      } else {
        self.setState({ storeLoading: false });
      }
    }).catch(function () {
      self.setState({ storeLoading: false });
    });
  }

  handleLanguageChange(e) {
    var code = e.target.value;
    this.props.dispatch({ type: 'language/setLanguage', payload: code });
    i18n.changeLanguage(code);
    document.documentElement.dir = getDirection(code);
    document.documentElement.lang = code;
    try { localStorage.setItem('language', code); } catch (err) {}
  }

  handleStoreChange(field, value) {
    this.setState(function (prev) {
      var update = {};
      update[field] = value;
      return { store: Object.assign({}, prev.store, update) };
    });
  }

  handleSaveStore() {
    var self = this;
    var t = this.props.t;
    this.setState({ savingStore: true });
    storeProfileAPI.update(this.state.store).then(function () {
      notify(t('settings.storeSaved'));
      self.setState({ savingStore: false });
    }).catch(function (err) {
      var message = (err.response && err.response.data && err.response.data.message) || t('common.error');
      notify(message, 'error');
      self.setState({ savingStore: false });
    });
  }

  render() {
    var t = this.props.t;
    var isRtl = document.documentElement.dir === 'rtl';
    var store = this.state.store;

    return React.createElement(ThemeContext.Consumer, null, function (theme) {
      return React.createElement('div', { className: 'max-w-2xl mx-auto space-y-6' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold' }, t('settings.title')),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, t('settings.subtitle'))
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, t('settings.language')),
          React.createElement('select',
            { value: this.props.currentLanguage, onChange: this.handleLanguageChange, className: 'input-field max-w-xs' },
            LANGUAGES.map(function (lang) {
              return React.createElement('option', { key: lang.code, value: lang.code }, lang.label);
            })
          )
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, t('settings.appearance')),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', null,
              React.createElement('p', { className: 'font-medium' }, t('settings.darkMode')),
              React.createElement('p', { className: 'text-sm text-gray-500' }, t('settings.darkModeDescription'))
            ),
            React.createElement('button', { onClick: theme.toggleDarkMode, className: 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (theme.darkMode ? 'bg-primary-600' : 'bg-gray-300') },
              React.createElement('span', { className: 'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ' + (theme.darkMode ? (isRtl ? '-translate-x-6' : 'translate-x-6') : (isRtl ? '-translate-x-1' : 'translate-x-1')) })
            )
          )
        ),
        React.createElement('div', { className: 'card p-6' },
          React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, t('settings.storeInformation')),
          React.createElement('p', { className: 'text-sm text-gray-500 mb-4' }, t('settings.contactFromAdmin')),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeName')),
              React.createElement('input', { type: 'text', value: store.name, onChange: function (e) { this.handleStoreChange('name', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeLogo')),
              React.createElement('input', { type: 'url', value: store.logo, onChange: function (e) { this.handleStoreChange('logo', e.target.value); }.bind(this), className: 'input-field', placeholder: 'https://' })
            ),
            React.createElement('div', { className: 'md:col-span-2' },
              React.createElement('label', { className: 'label' }, t('settings.storeEmail')),
              React.createElement('input', { type: 'email', value: store.email, onChange: function (e) { this.handleStoreChange('email', e.target.value); }.bind(this), className: 'input-field', placeholder: 'name@example.com' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storePhone')),
              React.createElement('input', { type: 'tel', value: store.phone, onChange: function (e) { this.handleStoreChange('phone', e.target.value); }.bind(this), className: 'input-field', placeholder: '+213 555 000 000' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storePhone2')),
              React.createElement('input', { type: 'tel', value: store.phone2, onChange: function (e) { this.handleStoreChange('phone2', e.target.value); }.bind(this), className: 'input-field', placeholder: '+213 555 000 000' })
            ),
            React.createElement('div', { className: 'md:col-span-2' },
              React.createElement('label', { className: 'label' }, t('settings.storeWhatsapp')),
              React.createElement('input', { type: 'tel', value: store.whatsapp, onChange: function (e) { this.handleStoreChange('whatsapp', e.target.value); }.bind(this), className: 'input-field', placeholder: '+213 555 000 000' })
            ),
            React.createElement('div', { className: 'md:col-span-2' },
              React.createElement('label', { className: 'label' }, t('settings.storeAddress')),
              React.createElement('textarea', { value: store.address, onChange: function (e) { this.handleStoreChange('address', e.target.value); }.bind(this), rows: 2, className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeFacebook')),
              React.createElement('input', { type: 'url', value: store.facebook, onChange: function (e) { this.handleStoreChange('facebook', e.target.value); }.bind(this), className: 'input-field', placeholder: 'https://' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeInstagram')),
              React.createElement('input', { type: 'url', value: store.instagram, onChange: function (e) { this.handleStoreChange('instagram', e.target.value); }.bind(this), className: 'input-field', placeholder: 'https://' })
            ),
            React.createElement('div', { className: 'md:col-span-2' },
              React.createElement('label', { className: 'label' }, t('settings.storeX')),
              React.createElement('input', { type: 'url', value: store.x, onChange: function (e) { this.handleStoreChange('x', e.target.value); }.bind(this), className: 'input-field', placeholder: 'https://' })
            )
          ),
          React.createElement('button', {
            type: 'button',
            onClick: this.handleSaveStore,
            disabled: this.state.savingStore || this.state.storeLoading,
            className: 'btn-primary mt-5',
          }, this.state.savingStore ? t('settings.savingStore') : t('settings.saveSettings'))
        )
      );
    }.bind(this));
  }
}

function mapStateToProps(state) {
  return { currentLanguage: state.language.code };
}

export default withTranslation()(connect(mapStateToProps)(Settings));
