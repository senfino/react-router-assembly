/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-14 00:31:52
 */

'use strict';

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
    {path: 'apples', component: propsPreloaderWrapper(2000, Apples, clientPropsGenerator)}
  ),
  React.createElement(
    Route,
    {path: '*', component: NotFound}
  )
);