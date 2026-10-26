import React from 'react';
import { withTranslation } from 'react-i18next';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { FaFacebookF, FaInstagram, FaXTwitter, FaWhatsapp } from 'react-icons/fa6';
import { getAssignedPhones, getWhatsappNumber } from '../../utils/storeContacts';

class StoreInfo extends React.Component {
  render() {
    var t = this.props.t;
    var store = this.props.store;

    var phones = getAssignedPhones(store);
    var whatsapp = getWhatsappNumber(store);

    var hasData = store && (
      store.name || store.logo || phones.length > 0 || whatsapp ||
      store.email || store.address || store.facebook || store.instagram || store.x
    );
    if (!hasData) return null;

    var name = store.name || t('app.name');
    var email = (store.email || '').trim();
    var address = (store.address || '').trim();

    var socials = [
      { key: 'facebook', href: store.facebook, label: 'Facebook', icon: FaFacebookF },
      { key: 'instagram', href: store.instagram, label: 'Instagram', icon: FaInstagram },
      { key: 'x', href: store.x, label: 'X', icon: FaXTwitter },
    ].filter(function (item) { return !!item.href; });

    var iconButtonClass = 'w-11 h-11 bg-gradient-to-br from-[#5B21B6] to-[#6C3DF2] rounded-full flex items-center justify-center text-white shadow-md shadow-purple-900/20 hover:shadow-lg hover:scale-110 active:scale-95 transition-all';

    return React.createElement('div', { className: 'product-surface overflow-hidden p-6 sm:p-8 text-center space-y-4' },
      store.logo
        ? React.createElement('img', {
            src: store.logo,
            alt: name,
            className: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover mx-auto shadow-lg ring-4 ring-purple-50',
          })
        : React.createElement('div', {
            className: 'w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#5B21B6] to-[#6C3DF2] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-900/20',
          },
            React.createElement('span', { className: 'text-2xl sm:text-3xl font-bold text-white' }, name.charAt(0).toUpperCase())
          ),

      React.createElement('h3', { className: 'text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900' }, name),

      phones.map(function (value, index) {
        return React.createElement('a', {
          key: 'phone-' + index,
          href: 'tel:' + value.replace(/[^\d+]/g, ''),
          className: 'mx-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-gray-600 hover:text-[#6C3DF2] hover:bg-purple-50 transition-colors',
          dir: 'ltr',
        },
          React.createElement(PhoneIcon, { className: 'w-5 h-5' }),
          React.createElement('span', { className: 'text-base' }, value)
        );
      }),

      email
        ? React.createElement('a', {
            href: 'mailto:' + email,
            className: 'mx-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-gray-600 hover:text-[#6C3DF2] hover:bg-purple-50 transition-colors break-all',
          },
            React.createElement(EnvelopeIcon, { className: 'w-5 h-5 flex-shrink-0' }),
            React.createElement('span', { className: 'text-base' }, email)
          )
        : null,

      address
        ? React.createElement('div', { className: 'flex items-start justify-center space-x-2 text-gray-600' },
            React.createElement(MapPinIcon, { className: 'w-5 h-5 mt-0.5 flex-shrink-0' }),
            React.createElement('span', { className: 'text-base whitespace-pre-line' }, address)
          )
        : null,

      whatsapp
        ? React.createElement('a', {
            href: 'https://wa.me/' + whatsapp.replace(/\D/g, ''),
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all',
          },
            React.createElement(FaWhatsapp, { className: 'w-5 h-5' }),
            React.createElement('span', null, t('storefront.store.whatsapp'))
          )
        : null,

      socials.length > 0
        ? React.createElement('div', { className: 'pt-2' },
            React.createElement('p', { className: 'text-xs font-medium text-gray-400 uppercase tracking-wider mb-3' }, t('storefront.store.followUs')),
            React.createElement('div', { className: 'flex items-center justify-center space-x-3' },
              socials.map(function (social) {
                var Icon = social.icon;
                return React.createElement('a', {
                  key: social.key,
                  href: social.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': social.label,
                  title: social.label,
                  className: iconButtonClass,
                },
                  React.createElement(Icon, { className: 'w-5 h-5' })
                );
              })
            )
          )
        : null
    );
  }
}

export default withTranslation()(StoreInfo);
