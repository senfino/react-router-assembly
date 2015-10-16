/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-13 21:53:12
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-14 00:17:13
 */
'use strict';

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;

// example components
var App = React.createClass({
  render: function(){
    return React.createElement('div', null, React.createElement('h1', null, 'It works!'));
  }
});

module.exports = React.createElement(
  Route, 
  {path: '/', component: App}
);