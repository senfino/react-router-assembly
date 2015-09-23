var React = require('react');
var Router = require('react-router');

module.exports = React.createClass({
  render (){
    return React.createElement(
      'div', 
      null, 
      'App component', 
      React.createElement('div', null, this.props.children),
      React.createElement(Router.Link, {to: '/'}, 'click me for index')
    );
  }
});