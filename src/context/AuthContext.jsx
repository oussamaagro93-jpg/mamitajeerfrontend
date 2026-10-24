import React from 'react';
import axios from 'axios';
import api from '../api/axios';
import { API_BASE_URL } from '../api/config';

var AuthContext = React.createContext(null);
var AuthConsumer = AuthContext.Consumer;

function isTokenExpired(token) {
  if (!token) return true;
  try {
    var base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    var payload = JSON.parse(window.atob(base64));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch (e) {
    return true;
  }
}

class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser() {
    var self = this;
    var accessToken = localStorage.getItem('accessToken');
    var refreshToken = localStorage.getItem('refreshToken');

    var clearAuth = function () {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      self.setState({ user: null, loading: false });
    };

    var fetchProfile = function () {
      return api.get('/auth/profile').then(function (res) {
        self.setState({ user: res.data.data.user, loading: false });
      }).catch(clearAuth);
    };

    if (!accessToken && !refreshToken) {
      this.setState({ loading: false });
      return;
    }

    // A valid access token can be used immediately.
    if (accessToken && !isTokenExpired(accessToken)) {
      fetchProfile();
      return;
    }

    // Refresh proactively so startup does not trigger a 401 on /auth/profile.
    if (refreshToken && !isTokenExpired(refreshToken)) {
      axios.post(API_BASE_URL + '/auth/refresh-token', { refreshToken: refreshToken })
        .then(function (res) {
          var tokens = res.data.data.tokens;
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          return fetchProfile();
        })
        .catch(clearAuth);
      return;
    }

    clearAuth();
  }

  login(email, password) {
    return api.post('/auth/login', { email: email, password: password }).then(function (res) {
      localStorage.setItem('accessToken', res.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.data.tokens.refreshToken);
      this.setState({ user: res.data.data.user });
      return res.data;
    }.bind(this));
  }

  register(userData) {
    return api.post('/auth/register', userData).then(function (res) {
      // Registration does not start a session. The user is sent to the
      // sign-in page, so make sure no stale session is left behind.
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.setState({ user: null });
      return res.data;
    }.bind(this));
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.setState({ user: null });
  }

  updateUser(userData) {
    this.setState(function (prev) {
      return { user: Object.assign({}, prev.user, userData) };
    });
  }

  render() {
    return React.createElement(
      AuthContext.Provider,
      { value: { user: this.state.user, loading: this.state.loading, login: this.login.bind(this), register: this.register.bind(this), logout: this.logout.bind(this), updateUser: this.updateUser.bind(this), loadUser: this.loadUser.bind(this) } },
      this.props.children
    );
  }
}

export { AuthContext, AuthProvider, AuthConsumer };
