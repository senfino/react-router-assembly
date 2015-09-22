'use strict';

var React = require('react');
var Router = require('react-router');
var IndexRoute = Router.IndexRoute;
var Route = Router.Route;

var NotFound = React.createClass({
  render: function(){
    return React.createElement('div', null, 'NotFound component');
  }
});

var App = React.createClass({
  render (){
    return React.createElement(
      'div', 
      null, 
      ['App component', React.createElement('div', null, this.props.children)]
    );
  }
});

var Apples = React.createClass({
  getInitialState (){
    console.log('Apples#getInitialState()');
    // console.log(this.props.params);
    // console.log(this.props.location.search);
    // console.log(this.props.route);
    // console.log(this.props.initialList);
    // console.log(this.props.params);
    // console.log(this.props.query);
    // console.log('---------------------------------------------');
    // console.log(this.props);
  
    return {};
  },
  render: function(){
    return React.createElement('div', null, 'Apples component');
  }
});

var Index = React.createClass({
  render: function(){
    return React.createElement('div', null, 'Index component');
  }
});

module.exports = function(componentise){
  return (
    React.createElement(
      Route, 
      {path: '/', component: componentise(App)},
      [
        React.createElement(
          IndexRoute,
          {component: componentise(Index)}
        ),
        React.createElement(
          Route,
          {path: 'apples/:appleType', component: componentise(Apples)}
        ),
        React.createElement(
          Route,
          {path: '*', component: componentise(NotFound)}
        )
      ]
    )
  );
};