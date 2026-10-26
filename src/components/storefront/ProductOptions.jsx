import React from 'react';
import { withTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

class ProductOptions extends React.Component {
  render() {
    var t = this.props.t;
    var product = this.props.product;
    var selected = this.props.selectedOptions || {};
    var onChange = this.props.onOptionChange || function () {};

    if (!product) return null;

    var variantColors = [];
    var variantSizes = [];
    var otherOptions = [];

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(function (v) {
        if (v.option1 && !variantColors.includes(v.option1)) {
          var parts = v.option1.split(': ');
          var val = parts.length > 1 ? parts[1] : parts[0];
          if (!variantColors.includes(val)) variantColors.push(val);
        }
        if (v.option2 && !variantSizes.includes(v.option2)) {
          var parts = v.option2.split(': ');
          var val = parts.length > 1 ? parts[1] : parts[0];
          if (!variantSizes.includes(val)) variantSizes.push(val);
        }
        if (v.option3 && !otherOptions.includes(v.option3)) {
          var parts = v.option3.split(': ');
          var val = parts.length > 1 ? parts[1] : parts[0];
          if (!otherOptions.includes(val)) otherOptions.push(val);
        }
      });
    }

    var hasOptions = variantColors.length > 0 || variantSizes.length > 0 || otherOptions.length > 0;
    if (!hasOptions) return null;

    var selectClass = 'w-full px-4 py-3 bg-white border border-purple-100 rounded-2xl text-gray-700 text-base appearance-none cursor-pointer focus:outline-none focus:border-[#6C3DF2] focus:ring-2 focus:ring-[#6C3DF2]/20 transition-all';
    var labelClass = 'block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 mb-2';

    return React.createElement('div', { className: 'product-surface p-5 sm:p-6 space-y-5' },
      variantColors.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.options.color')),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          variantColors.map(function (color) {
            var isSelected = selected.color === color;
            return React.createElement('button', {
              key: color,
              onClick: function () { onChange('color', color); },
              className: 'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ' +
                (isSelected
                  ? 'bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white border-transparent shadow-lg shadow-purple-900/20 scale-[1.02]'
                  : 'bg-white text-gray-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50/60 hover:-translate-y-0.5'),
            }, color);
          })
        )
      ),

      variantSizes.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.options.size')),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          variantSizes.map(function (size) {
            var isSelected = selected.size === size;
            return React.createElement('button', {
              key: size,
              onClick: function () { onChange('size', size); },
              className: 'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ' +
                (isSelected
                  ? 'bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white border-transparent shadow-lg shadow-purple-900/20 scale-[1.02]'
                  : 'bg-white text-gray-700 border-purple-100 hover:border-purple-300 hover:bg-purple-50/60 hover:-translate-y-0.5'),
            }, size);
          })
        )
      ),

      otherOptions.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: labelClass }, t('storefront.options.variant')),
        React.createElement('div', { className: 'relative' },
          React.createElement('select', {
            value: selected.option3 || '',
            onChange: function (e) { onChange('option3', e.target.value); },
            className: selectClass,
          },
            React.createElement('option', { value: '' }, t('storefront.options.selectOption')),
            otherOptions.map(function (opt) {
              return React.createElement('option', { key: opt, value: opt }, opt);
            })
          ),
          React.createElement(ChevronDownIcon, { className: 'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' })
        )
      )
    );
  }
}

export default withTranslation()(ProductOptions);
