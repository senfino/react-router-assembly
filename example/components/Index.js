let React = require('react');
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