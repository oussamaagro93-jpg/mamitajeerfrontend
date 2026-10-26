import React from 'react';
import { withTranslation } from 'react-i18next';
import { ChatBubbleLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';

class StickyBottomBar extends React.Component {
  render() {
    var t = this.props.t;
    var onBuyClick = this.props.onBuyClick || function () {};
    var onWhatsAppClick = this.props.onWhatsAppClick;

    return React.createElement('div', { className: 'fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-3 flex items-center justify-between space-x-3' },

        // Chat button
        React.createElement('button', {
          onClick: this.props.onChatClick,
          className: 'w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0',
        },
          React.createElement(ChatBubbleLeftIcon, { className: 'w-6 h-6 text-gray-600' })
        ),

        // Buy Now button
        React.createElement('button', {
          onClick: onBuyClick,
          className: 'flex-1 bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-[#6C3DF2]/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg',
        }, t('storefront.buyButton')),

        // WhatsApp button (only when the store has a configured number)
        onWhatsAppClick
          ? React.createElement('button', {
              onClick: onWhatsAppClick,
              className: 'w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors flex-shrink-0',
              'aria-label': t('storefront.store.whatsapp'),
            },
              React.createElement(PhoneIcon, { className: 'w-6 h-6 text-white' })
            )
          : null
      )
    );
  }
}

export default withTranslation()(StickyBottomBar);
