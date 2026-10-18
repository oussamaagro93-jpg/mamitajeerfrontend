import React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { LANGUAGES } from '../../store/languageSlice';
import { getDirection } from '../../utils/direction';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

class LanguageSwitcher extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    var code = e.target.value;
    this.props.dispatch({ type: 'language/setLanguage', payload: code });
    i18n.changeLanguage(code);
    document.documentElement.dir = getDirection(code);
    document.documentElement.lang = code;
    try {
      localStorage.setItem('language', code);
    } catch (err) {}
  }

  render() {
    return React.createElement(
      'div',
      { className: 'relative' },
      React.createElement(
        'select',
        {
          value: this.props.currentLanguage,
          onChange: this.handleChange,
          className: 'appearance-none bg-transparent text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer py-1 pl-7 pr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none',
          'aria-label': 'Select language',
        },
        LANGUAGES.map(function (lang) {
          return React.createElement(
            'option',
            { key: lang.code, value: lang.code },
            lang.label
          );
        })
      ),
      React.createElement(GlobeAltIcon, {
        className: 'absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none',
      })
    );
  }
}

function mapStateToProps(state) {
  return { currentLanguage: state.language.code };
}

export default connect(mapStateToProps)(LanguageSwitcher);
