/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 21:01:32
 */

'use strict';

let React = require('react');
let Router = require('react-router');
let logger = require('plain-logger')('App');

module.exports = React.createClass({
  render(){
    logger.log('#render()');

    return React.createElement(
      'div', 
      null,
      React.createElement('h1', null, 'App'),
      'Links in react-router use context which was changed from owner-based to parent-based that\'s why they\'re used as examples.',
      React.createElement(Router.Link, {to: '/apples'}, 'click me for nested Apples component'),
      React.createElement(Router.Link, {to: '/some-non-existent-path'}, 'click me for separate NotFound component'),
      this.props.children
    );
  }
});