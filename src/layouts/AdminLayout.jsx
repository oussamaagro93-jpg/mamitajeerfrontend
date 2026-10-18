import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default class AdminLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sidebarOpen: false };
  }

  render() {
    return React.createElement('div', { className: 'flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900' },
      React.createElement(Sidebar, { open: this.state.sidebarOpen, setOpen: function (v) { this.setState({ sidebarOpen: v }); }.bind(this) }),
      React.createElement('div', { className: 'flex flex-col flex-1 min-w-0' },
        React.createElement(Header, { onMenuClick: function () { this.setState({ sidebarOpen: true }); }.bind(this) }),
        React.createElement('main', { className: 'flex-1 overflow-y-auto p-4 md:p-6 lg:p-8' },
          this.props.children
        )
      )
    );
  }
}
