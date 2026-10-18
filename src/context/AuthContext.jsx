import React from 'react';
import api from '../api/axios';

var AuthContext = React.createContext(null);
var AuthConsumer = AuthContext.Consumer;

class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
  }

  componentDidMount() {
    this.loadUser();
  }

  loadUser() {
    var token = localStorage.getItem('accessToken');
    if (!token) {
      this.setState({ loading: false });
      return;
    }
    api.get('/auth/profile').then(function (res) {
      this.setState({ user: res.data.data.user, loading: false });
    }.bind(this)).catch(function () {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.setState({ loading: false });
    }.bind(this));
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
      localStorage.setItem('accessToken', res.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.data.tokens.refreshToken);
      this.setState({ user: res.data.data.user });
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
