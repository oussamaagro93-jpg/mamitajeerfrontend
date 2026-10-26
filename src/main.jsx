import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { store, persistor } from './store';
import App from './App';
import Toast from './components/common/Toast';
import MetaPixel from './utils/pixel';
import './i18n';
import './styles/index.css';

MetaPixel.init();

ReactDOM.render(
  React.createElement(React.StrictMode, null,
    React.createElement(Provider, { store: store },
      React.createElement(PersistGate, { loading: null, persistor: persistor },
        React.createElement(BrowserRouter, null,
          React.createElement(AuthProvider, null,
            React.createElement(CartProvider, null,
              React.createElement(ThemeProvider, null,
                React.createElement(React.Fragment, null,
                  React.createElement(App, null),
                  React.createElement(Toast, null)
                )
              )
            )
          )
        )
      )
    )
  ),
  document.getElementById('root')
);
