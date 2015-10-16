/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-14 00:05:45
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-14 00:49:15
 */
'use strict';

let React = require('react');

let propsPreloaderWrapper = function(timeout, originalComponent, generatorFunction){
  return React.createClass({
    getInitialState: function(){
      return {
        timedOut: false,
        erroredOut: false,
        originalComponentProps: null
      };
    },
    onTimeout: function(){
      this.setState({
        timedOut: true
      });
    },
    componentDidMount: function(){
      this.timeout = setTimeout(this.onTimeout, timeout);

      generatorFunction(this.props).then((originalComponentProps) => {
        clearTimeout(this.timeout);
        this.timeout = null;

        this.setState({
          originalComponentProps: originalComponentProps
        });
      }, () => {
        this.setState({
          erroredOut: true
        });
      });
    },
    componentWillUnmount: function(){
      clearTimeout(this.timeout);
    },
    render: function(){

      if(this.state.timedOut){
        return React.createElement('div', {className: 'props-preloader-wrapper props-preloader-wrapper-timed-out'});
      }else if(this.state.erroredOut){
        return React.createElement('div', {className: 'props-preloader-wrapper props-preloader-wrapper-errored-out'});
      }else if(this.state.originalComponentProps === null){//make better condition
        return React.createElement('div', {className: 'props-preloader-wrapper'});
      }else{
        let _ = require('lodash');

        return React.cloneElement(originalComponent, _.assign({}, this.props, originalComponentProps));
      }
    }
  });
};

module.exports = propsPreloaderWrapper;