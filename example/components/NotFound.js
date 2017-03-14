let React = require('react');
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