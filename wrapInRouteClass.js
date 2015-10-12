// /* 
//  * @Author: Tomasz Niezgoda
//  * @Date: 2015-10-04 21:22:40
//  * @Last Modified by: Tomasz Niezgoda
//  * @Last Modified time: 2015-10-11 19:12:06
//  */

// 'use strict';

// let React = require('react');
// let _ = require('lodash');
// let logger = require('plain-logger')('wrapInRouteClass');

// module.exports = function(Component){
//   return Component;
//   // return React.createClass({
//   //   childContextTypes: {
//   //     hhh: React.PropTypes.string.isRequired
//   //   },
//   //   getChildContext: function(){
//   //     return {
//   //       hhh: 'HHH'
//   //     }
//   //   },
//   //   render: function(){
//   //     return React.createElement('div', null, React.createElement(Component));
//   //     // let children = this.props.children;
//   //     // children = children();
//   //     // return children;
//   //   }
//   // });
//   // return React.createClass({
//   //   render: function(){
//   //     return React.createElement(Component, _.assign({}, this.props.route.serverProps), this.props.children);
//   //   }
//   // });
// };