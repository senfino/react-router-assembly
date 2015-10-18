/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 23:05:23
 */

'use strict';

var React = require('react');
let logger = require('plain-logger')('Index');

module.exports = React.createClass({
  render: function(){
    logger.log('#render()');

    return React.createElement(
      'div', 
      null, 
      'default Index child inside App',
      React.createElement('br'),
      'Add test: 5 + 13 = ' + this.props.route.add(5, 13)
    );
  }
});