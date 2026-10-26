import React from 'react';
import { withTranslation } from 'react-i18next';
import { ChatBubbleLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';

class StickyBottomBar extends React.Component {
  render() {
    var t = this.props.t;
    var onBuyClick = this.props.onBuyClick || function () {};
    var onWhatsAppClick = this.props.onWhatsAppClick;

    return React.createElement('div', { className: 'fixed bottom-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-t border-purple-100/80 shadow-[0_-10px_40px_rgba(76,29,149,0.14)] pb-[env(safe-area-inset-bottom)]' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3' },

        // Chat button
        React.createElement('button', {
          onClick: this.props.onChatClick,
          className: 'w-11 h-11 sm:w-12 sm:h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 ring-1 ring-purple-100 hover:bg-purple-100 active:scale-95 transition-all flex-shrink-0',
        },
          React.createElement(ChatBubbleLeftIcon, { className: 'w-6 h-6' })
        ),

        // Buy Now button
        React.createElement('button', {
          onClick: onBuyClick,
          className: 'flex-1 bg-gradient-to-r from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] text-white font-bold py-3 px-5 sm:px-8 rounded-2xl shadow-lg shadow-purple-900/25 hover:shadow-xl hover:shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-base sm:text-lg',
        }, t('storefront.buyButton')),

        // WhatsApp button (only when the store has a configured number)
        onWhatsAppClick
          ? React.createElement('button', {
              onClick: onWhatsAppClick,
              className: 'w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-900/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0',
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
