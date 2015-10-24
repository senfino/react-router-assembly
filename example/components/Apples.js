/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-24 21:32:49
 */

'use strict';

let React = require('react');
let Router = require('react-router');
let logger = require('plain-logger')('Apples');

module.exports = React.createClass({
  getInitialState: function(){
    return {
      selection: this.props.route.initialSelection,
      list: this.props.route.initialList || ['white', 'black']
    };
  },
  onListItemClick: function(listItemIndex){
    this.setState({selection: this.state.list[listItemIndex]});
  },
  render(){
    let list = React.createElement(
      'ul',
      null,
      this.state.list.map(function(listItem, listItemIndex){
        return React.createElement(
          'li', 
          {key: listItemIndex, onClick: function(){this.onListItemClick(listItemIndex)}.bind(this)}, 
          listItem + (listItem === this.state.selection?'<- selected':'')
        );
      }.bind(this))
    );

    logger.log('#render()');

    return React.createElement(
      'div', 
      null, 
      React.createElement('h1', null, 'Apples'),
      React.createElement(Router.Link, {to: '/'}, 'click me for App component only'),
      list
    );
  }
});