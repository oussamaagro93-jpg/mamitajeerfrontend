import React from 'react';
import { withTranslation } from 'react-i18next';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

class StoreInfo extends React.Component {
  render() {
    var t = this.props.t;

    return React.createElement('div', { className: 'bg-white rounded-2xl p-6 shadow-lg border-2 border-[#6C3DF2]/20 text-center space-y-4' },

      // Logo
      React.createElement('div', {
        className: 'w-16 h-16 bg-[#6C3DF2] rounded-2xl flex items-center justify-center mx-auto shadow-lg',
      },
        React.createElement('span', { className: 'text-2xl font-bold text-white' }, t('app.logo'))
      ),

      // Store Name
      React.createElement('h3', { className: 'text-xl font-bold text-gray-900' }, t('app.name')),

      // Phone
      React.createElement('div', { className: 'flex items-center justify-center space-x-2 text-gray-600' },
        React.createElement(PhoneIcon, { className: 'w-5 h-5' }),
        React.createElement('span', { className: 'text-base' }, t('storefront.store.phone'))
      ),

      // Email
      React.createElement('div', { className: 'flex items-center justify-center space-x-2 text-gray-600' },
        React.createElement(EnvelopeIcon, { className: 'w-5 h-5' }),
        React.createElement('span', { className: 'text-base' }, t('storefront.store.email'))
      ),

      // Social buttons
      React.createElement('div', { className: 'flex items-center justify-center space-x-3 pt-2' },
        React.createElement('a', {
          href: '#',
          className: 'w-11 h-11 bg-[#6C3DF2] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#5B21B6] transition-colors',
        }, 'F'),
        React.createElement('a', {
          href: '#',
          className: 'w-11 h-11 bg-[#6C3DF2] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#5B21B6] transition-colors',
        }, 'I'),
        React.createElement('a', {
          href: '#',
          className: 'w-11 h-11 bg-[#6C3DF2] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#5B21B6] transition-colors',
        }, 'X'),
      )
    );
  }
}

export default withTranslation()(StoreInfo);
