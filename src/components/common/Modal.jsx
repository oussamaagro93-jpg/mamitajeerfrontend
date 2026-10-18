import React from 'react';
import { withTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';

class Modal extends React.Component {
  render() {
    var t = this.props.t;
    var open = this.props.open;
    var onClose = this.props.onClose || function () {};
    var title = this.props.title || '';

    if (!open) return null;

    return React.createElement('div', { className: 'fixed inset-0 z-50 overflow-y-auto' },
      React.createElement('div', { className: 'fixed inset-0 bg-black/40', onClick: onClose }),
      React.createElement('div', { className: 'flex min-h-full items-center justify-center p-4' },
        React.createElement('div', { className: 'card w-full max-w-md relative' },
          React.createElement('div', { className: 'flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, title),
            React.createElement('button', { onClick: onClose, className: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' },
              React.createElement(XMarkIcon, { className: 'w-5 h-5' })
            )
          ),
          React.createElement('div', { className: 'px-6 py-4' },
            this.props.children
          )
        )
      )
    );
  }
}

export default withTranslation()(Modal);
