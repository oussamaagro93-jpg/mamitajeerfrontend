import React from 'react';

var ThemeContext = React.createContext(null);
var ThemeConsumer = ThemeContext.Consumer;

class ThemeProvider extends React.Component {
  constructor(props) {
    super(props);
    var saved = localStorage.getItem('darkMode');
    var initialDark = saved ? JSON.parse(saved) : false;
    this.state = { darkMode: initialDark };
  }

  componentDidMount() {
    this.applyTheme(this.state.darkMode);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.darkMode !== this.state.darkMode) {
      this.applyTheme(this.state.darkMode);
    }
  }

  applyTheme(dark) {
    localStorage.setItem('darkMode', JSON.stringify(dark));
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.setState(function (prev) {
      return { darkMode: !prev.darkMode };
    });
  }

  render() {
    return React.createElement(
      ThemeContext.Provider,
      { value: { darkMode: this.state.darkMode, toggleDarkMode: this.toggleDarkMode.bind(this) } },
      this.props.children
    );
  }
}

export { ThemeContext, ThemeProvider, ThemeConsumer };
