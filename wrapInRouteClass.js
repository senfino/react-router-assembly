'use strict';

let React = require('react');
let _ = require('lodash');

module.exports = function(Component){
  return Component;
  // return React.createClass({
  //   render: function(){
  //     return React.createElement(Component, _.assign({}, this.props.route.serverProps), this.props.children);
  //   }
  // });
};