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

    var selectClass = 'w-full px-4 py-3 bg-white border-2 border-[#6C3DF2]/30 rounded-xl text-gray-700 text-base appearance-none cursor-pointer focus:outline-none focus:border-[#6C3DF2] focus:ring-2 focus:ring-[#6C3DF2]/20 transition-all';

    return React.createElement('div', { className: 'space-y-3' },
      variantColors.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-500 mb-1.5' }, t('storefront.options.color')),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          variantColors.map(function (color) {
            var isSelected = selected.color === color;
            return React.createElement('button', {
              key: color,
              onClick: function () { onChange('color', color); },
              className: 'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ' +
                (isSelected ? 'bg-[#6C3DF2] text-white border-[#6C3DF2] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#6C3DF2]/50'),
            }, color);
          })
        )
      ),

      variantSizes.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-500 mb-1.5' }, t('storefront.options.size')),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          variantSizes.map(function (size) {
            var isSelected = selected.size === size;
            return React.createElement('button', {
              key: size,
              onClick: function () { onChange('size', size); },
              className: 'px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ' +
                (isSelected ? 'bg-[#6C3DF2] text-white border-[#6C3DF2] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#6C3DF2]/50'),
            }, size);
          })
        )
      ),

      otherOptions.length > 0 && React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-500 mb-1.5' }, t('storefront.options.variant')),
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
