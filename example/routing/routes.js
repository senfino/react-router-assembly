var React = require('react');
var Router = require('react-router');
var IndexRoute = Router.IndexRoute;
var Route = Router.Route;

// example components
var NotFound = require('../components/NotFound');
var App = require('../components/App');
var Apples = require('../components/Apples');
var Index = require('../components/Index');

module.exports = React.createElement(
  Route, 
  {path: '/', component: App},
  React.createElement(
    IndexRoute,
    {component: Index}
  ),
  React.createElement(
    Route,
    {path: 'apples', component: Apples}
  ),
  React.createElement(
    Route,
    {path: '*', component: NotFound}
  )
);