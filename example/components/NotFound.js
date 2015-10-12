/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 19:50:06
 */

'use strict';

var React = require('react');
let logger = require('plain-logger')('NotFound');

module.exports = React.createClass({
  render: function(){
    logger.log('#render()');

    return React.createElement(
      'div', 
      null, 
      React.createElement('h1', null, 'NotFound')
    );
  }
});