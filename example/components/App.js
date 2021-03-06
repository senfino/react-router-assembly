let React = require('react');
let Router = require('react-router');
let logger = require('plain-logger')('App');

module.exports = React.createClass({
  getInitialState: function(){
    return {};
  },
  componentWillReceiveProps: function(nextProps){
    // just an example!
    this.setState({
      subpage: nextProps.route.subpage
    });
  },
  componentDidMount: function(){
    // just an example!
    this.setState({
      subpage: this.props.route.subpage
    });
  },
  render(){
    logger.log('#render()');

    return React.createElement(
      'div', 
      null,
      React.createElement('h1', null, 'App'),
      'Try turning off JavaScript and checking that the server renders the website.',
      React.createElement('br'),
      React.createElement(Router.Link, {to: '/apples'}, 'click me for nested Apples component'),
      React.createElement('br'),
      React.createElement(Router.Link, {to: '/some-non-existent-path'}, 'click me for separate NotFound component'),
      this.props.children,
      `subpage prop = ${this.state.subpage}, from clientProps (defined only if JavaScript is enabled)`
    );
  }
});