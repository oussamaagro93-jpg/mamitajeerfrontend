import React from 'react';
import { withTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { countries, statesByCountry } from '../../utils/locationData';

class CustomerInfo extends React.Component {
  constructor(props) {
    super(props);
    this.handleWilayaChange = this.handleWilayaChange.bind(this);
    this.handleCommuneChange = this.handleCommuneChange.bind(this);
  }

  handleWilayaChange(e) {
    var value = e.target.value;
    var wilayas = this.props.wilayas || [];
    var wilaya = wilayas.find(function (w) { return String(w.id) === String(value); });
    this.props.onChange({
      wilayaId: value,
      guestWilaya: wilaya ? (wilaya.nameFr || wilaya.name) : '',
      communeId: '',
      city: '',
    });
    if (this.props.onWilayaChange) {
      this.props.onWilayaChange(value);
    }
  }

  handleCommuneChange(e) {
    var value = e.target.value;
    var communes = this.props.communes || [];
    var commune = communes.find(function (c) { return String(c.id) === String(value); });
    this.props.onChange({
      communeId: value,
      city: commune ? (commune.nameFr || commune.name) : '',
    });
    if (this.props.onCommuneChange) {
      this.props.onCommuneChange(value);
    }
  }

  render() {
    var t = this.props.t;
    var form = this.props.form || {};
    var onChange = this.props.onChange || function () {};

    var inputClass = 'w-full px-4 py-3 bg-white border-2 border-[#6C3DF2]/30 rounded-xl text-gray-700 text-base placeholder-gray-400 focus:outline-none focus:border-[#6C3DF2] focus:ring-2 focus:ring-[#6C3DF2]/20 transition-all';
    var selectClass = 'w-full px-4 py-3 bg-white border-2 border-[#6C3DF2]/30 rounded-xl text-gray-700 text-base appearance-none cursor-pointer focus:outline-none focus:border-[#6C3DF2] focus:ring-2 focus:ring-[#6C3DF2]/20 transition-all';
    var labelClass = 'block text-sm font-medium text-gray-500 mb-1.5';

    var wilayas = this.props.wilayas;
    var communes = this.props.communes;

    if (wilayas) {
      return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20 space-y-4' },

        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, t('storefront.customerInfo.title')),

        // Wilaya
        React.createElement('div', null,
          React.createElement('label', { className: labelClass }, t('checkout.wilaya')),
          React.createElement('div', { className: 'relative' },
            React.createElement('select', {
              value: form.wilayaId || '',
              onChange: this.handleWilayaChange,
              className: selectClass,
            },
              React.createElement('option', { value: '' }, t('checkout.selectWilaya')),
              wilayas.map(function (w) {
                return React.createElement('option', { key: w.id, value: w.id }, (w.nameFr || w.name) + ' - ' + (w.nameAr || ''));
              })
            ),
            React.createElement(ChevronDownIcon, { className: 'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' })
          )
        ),

        // Commune
        React.createElement('div', null,
          React.createElement('label', { className: labelClass }, t('checkout.commune')),
          React.createElement('div', { className: 'relative' },
            React.createElement('select', {
              value: form.communeId || '',
              onChange: this.handleCommuneChange,
              className: selectClass,
              disabled: communes.length === 0,
            },
              React.createElement('option', { value: '' }, communes.length === 0 ? t('checkout.selectWilayaFirst') : t('checkout.selectCommune')),
              communes.map(function (c) {
                return React.createElement('option', { key: c.id, value: c.id }, (c.nameFr || c.name) + ' - ' + (c.nameAr || ''));
              })
            ),
            React.createElement(ChevronDownIcon, { className: 'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' })
          )
        ),

        // Address
        React.createElement('div', null,
          React.createElement('label', { className: labelClass }, t('storefront.customerInfo.address')),
          React.createElement('textarea', {
            value: form.address || '',
            onChange: function (e) { onChange('address', e.target.value); },
            placeholder: t('storefront.customerInfo.addressPlaceholder'),
            rows: 2,
            className: inputClass + ' resize-none',
          })
        ),

        // Note
        React.createElement('div', null,
          React.createElement('label', { className: labelClass }, t('storefront.customerInfo.note')),
          React.createElement('textarea', {
            value: form.note || '',
            onChange: function (e) { onChange('note', e.target.value); },
            placeholder: t('storefront.customerInfo.notePlaceholder'),
            rows: 2,
            className: inputClass + ' resize-none',
          })
        )
      );
    }

    var states = form.country ? (statesByCountry[form.country] || []) : [];

    return React.createElement('div', { className: 'bg-white rounded-2xl p-5 shadow-lg border-2 border-[#6C3DF2]/20 space-y-4' },

      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, t('storefront.customerInfo.title')),

      // Country
      React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.customerInfo.country')),
        React.createElement('div', { className: 'relative' },
          React.createElement('select', {
            value: form.country || '',
            onChange: function (e) { onChange('country', e.target.value); },
            className: selectClass,
          },
            React.createElement('option', { value: '' }, t('storefront.customerInfo.selectCountry')),
            countries.map(function (c) {
              return React.createElement('option', { key: c.code, value: c.code }, c.name);
            })
          ),
          React.createElement(ChevronDownIcon, { className: 'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' })
        )
      ),

      // State
      React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.customerInfo.state')),
        React.createElement('div', { className: 'relative' },
          React.createElement('select', {
            value: form.state || '',
            onChange: function (e) { onChange('state', e.target.value); },
            className: selectClass,
            disabled: states.length === 0,
          },
            React.createElement('option', { value: '' }, t('storefront.customerInfo.selectState')),
            states.map(function (s) {
              return React.createElement('option', { key: s.code, value: s.code }, s.name);
            })
          ),
          React.createElement(ChevronDownIcon, { className: 'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' })
        )
      ),

      // City
      React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.customerInfo.city')),
        React.createElement('input', {
          type: 'text',
          value: form.city || '',
          onChange: function (e) { onChange('city', e.target.value); },
          placeholder: t('storefront.customerInfo.cityPlaceholder'),
          className: inputClass,
        })
      ),

      // Address
      React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.customerInfo.address')),
        React.createElement('textarea', {
          value: form.address || '',
          onChange: function (e) { onChange('address', e.target.value); },
          placeholder: t('storefront.customerInfo.addressPlaceholder'),
          rows: 2,
          className: inputClass + ' resize-none',
        })
      ),

      // Note
      React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.customerInfo.note')),
        React.createElement('textarea', {
          value: form.note || '',
          onChange: function (e) { onChange('note', e.target.value); },
          placeholder: t('storefront.customerInfo.notePlaceholder'),
          rows: 2,
          className: inputClass + ' resize-none',
        })
      )
    );
  }
}

export default withTranslation()(CustomerInfo);
