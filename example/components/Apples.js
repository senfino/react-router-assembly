'use strict';

let React = require('react');
let Router = require('react-router');

module.exports = React.createClass({
  getInitialState (){
    console.log('Apples#getInitialState()');
    // console.log(this.props.params);
    // console.log(this.props.location.search);
    // console.log(this.props.route);
    // console.log(this.props.initialList);
    // console.log(this.props.params);
    // console.log(this.props.query);
    // console.log('---------------------------------------------');
    console.log(this.props);
  
    return {};
  },
  childContextTypes: {
       name: React.PropTypes.string.isRequired
  },

  getChildContext: function() {
       return { name: "Jonas" };
  },
  render: function(){
    return React.createElement('div', null, 
      'Apples component'
    );
  }
});