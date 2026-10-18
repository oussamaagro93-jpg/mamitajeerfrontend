import React from 'react';
import { withTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

var toastQueue = [];
var listeners = [];

function notify(message, type) {
  if (type === void 0) type = 'success';
  var id = Date.now() + Math.random();
  toastQueue.push({ id: id, message: message, type: type });
  listeners.forEach(function (fn) { fn(toastQueue.slice()); });
  setTimeout(function () {
    toastQueue = toastQueue.filter(function (t) { return t.id !== id; });
    listeners.forEach(function (fn) { fn(toastQueue.slice()); });
  }, 4000);
}

class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toasts: [] };
  }

  componentDidMount() {
    var self = this;
    listeners.push(function (toasts) { self.setState({ toasts: toasts }); });
  }

  render() {
    var t = this.props.t;
    return React.createElement('div', { className: 'fixed top-4 right-4 z-[100] space-y-2' },
      this.state.toasts.map(function (toast) {
        return React.createElement('div', {
          key: toast.id,
          className: 'px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all flex items-center space-x-2 ' + (
            toast.type === 'error'
              ? 'bg-danger-50 dark:bg-red-900/30 text-danger-600 dark:text-red-400 border border-danger-200 dark:border-red-800'
              : 'bg-success-50 dark:bg-green-900/30 text-success-600 dark:text-green-400 border border-success-200 dark:border-green-800'
          )
        },
          toast.type === 'error'
            ? React.createElement(XCircleIcon, { className: 'w-5 h-5 flex-shrink-0' })
            : React.createElement(CheckCircleIcon, { className: 'w-5 h-5 flex-shrink-0' }),
          React.createElement('span', null, toast.message)
        );
      })
    );
  }
}

export { notify };
export default withTranslation()(Toast);
