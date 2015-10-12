/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 19:50:24
 */

'use strict';

let React = require('react');
let Router = require('react-router');
let logger = require('plain-logger')('Apples');

module.exports = React.createClass({
  render(){
    logger.log('#render()');

    return React.createElement(
      'div', 
      null, 
      React.createElement('h1', null, 'Apples'),
      React.createElement(Router.Link, {to: '/'}, 'click me for App component only')
    );
  }
});