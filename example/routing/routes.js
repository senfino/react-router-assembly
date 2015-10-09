'use strict';

var React = require('react');
var Router = require('react-router');
var IndexRoute = Router.IndexRoute;
var Route = Router.Route;

// example components
var NotFound = require('../components/NotFound');
// var App = require('../components/App');
var Apples = require('../components/Apples');
var Index = require('../components/Index');

module.exports = function(wrapInRouteClass){
  return (
    React.createElement(
      Route, 
      {path: '/', component: wrapInRouteClass(App)}//,
      // React.createElement(
      //   IndexRoute,
      //   {component: wrapInRouteClass(Index)}
      // )
      /*,
      React.createElement(
        Route,
        {path: 'apples/:appleType', component: wrapInRouteClass(Apples)}
      ),
      React.createElement(
        Route,
        {path: '*', component: wrapInRouteClass(NotFound)}
      )*/
    )
  );
};