/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-04 20:25:15
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-04 22:42:00
 */

var React = require('react');
var Router = require('react-router');

module.exports = React.createClass({
  contextTypes: {
    // location: React.PropTypes.object,
    ddd: React.PropTypes.string,
    hhh: React.PropTypes.string
  },
  render: function(){
    console.log('ContextExampleComponent');
    console.log(this.context);

    return React.createElement('div');
  }
});