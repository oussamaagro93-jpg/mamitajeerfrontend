import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import i18n from '../i18n';
import { getDirection } from '../utils/direction';
import { ThemeContext } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { LANGUAGES } from '../store/languageSlice';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  handleLanguageChange(e) {
    var code = e.target.value;
    this.props.dispatch({ type: 'language/setLanguage', payload: code });
    i18n.changeLanguage(code);
    document.documentElement.dir = getDirection(code);
    document.documentElement.lang = code;
    try { localStorage.setItem('language', code); } catch (err) {}
  }

  render() {
    var t = this.props.t;
    var isRtl = document.documentElement.dir === 'rtl';
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
          React.createElement('h2', { className: 'text-lg font-semibold mb-4' }, t('settings.storeInformation')),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeName')),
              React.createElement('input', { type: 'text', defaultValue: t('app.name'), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('settings.storeEmail')),
              React.createElement('input', { type: 'email', defaultValue: 'admin@tajer.com', className: 'input-field' })
            ),
            React.createElement('button', { className: 'btn-primary' }, t('settings.saveSettings'))
          )
        )
      );
    }.bind(this));
  }
}

function mapStateToProps(state) {
  return { currentLanguage: state.language.code };
}

export default withTranslation()(connect(mapStateToProps)(Settings));
