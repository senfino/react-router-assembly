// 'use strict';

// // DO NOT MODIFY

// var React = require('react');
// var Router = require('react-router');
// var logger = require('plain-logger')('reactRoutes');
// var _ = require('lodash');

// function createWrapper(ReactClass, serverPropsGrabber){
//   return React.createClass({
//     mixins: [Router.State],
//     render: function(){
//       var routeParts = this.getRoutes().map(function(route){return route.path});
//       var initialProps = serverPropsGrabber.get(routeParts) || {};
//       var targetProps;

//       logger.log('createWrapper');

//       // params are filled by react router but they don't descend to 
//       // subcomponents, so we need to explicitly send them through
//       targetProps = _.assign(initialProps, this.props);

//       return React.createElement(ReactClass, targetProps);
//     }
//   });
// };


// module.exports = function(serverPropsGrabber){
//   var routes;

//   function stateful(ReactClass){
//     return createWrapper(ReactClass, serverPropsGrabber);
//   }

//   // routes make rendering easier because putting <RouteHandler/> inside #render
//   // outputs the whole hierarchy needed
//   routes = require('./routing/router')(stateful);

//   return routes;
// };