var React = require('react');
var Router = require('react-router');
var ContextExampleComponent = require('./ContextExampleComponent');

module.exports = React.createClass({
  // contextTypes: {
  //   // location: React.PropTypes.object,
  //   history: React.PropTypes.object
  // },
  // childContextTypes: {
  //      history: React.PropTypes.string.isRequired
  // },
  // getChildContext: function(){
  //   return {
  //     history: 'dupa'
  //   }
  // },
  contextTypes: {
    // location: React.PropTypes.object,
    hhh: React.PropTypes.string
  },
  childContextTypes: {
    ddd: React.PropTypes.string.isRequired
  },
  getChildContext: function(){
    return {
      ddd: 'DDD'
    }
  },
  render: function(){
    console.log('App');
    console.log(this.context);
    return React.createElement('div', null, React.createElement(ContextExampleComponent));
    // return React.createElement('div');
    // return React.createElement(
    //   'div', 
    //   null, 
    //   'App component', 
    //   React.createElement('div', null, this.props.children),
    //   React.createElement(ContextExampleComponent)
    //   // React.createElement(Router.Link, {to: '/'}, 'click me for index')
    // );
  }
});