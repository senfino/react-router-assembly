'use strict';

let React = require('react');
let Router = require('react-router');
let $ = require('jquery');
let createBrowserHistory = require('history/lib/createBrowserHistory');

$(function(){
  let history = createBrowserHistory();

  history.listen(function(location, error){

    console.log('error');
    console.log(error);
    console.log('location');
    console.log(location);

    if (error) {
      throw error;
    } else {
      let match = Router.match;
      let routesElement = require('../routing/routes');
      let createLocation = require('history/lib/createLocation');
      let wrapInRouteClass = require('../../wrapInRouteClass');
      let RoutingContext = Router.RoutingContext;

      match({routes: routesElement(wrapInRouteClass), location: location}, function(error, redirectLocation, renderProps){
        // console.log(error); this might be needed on the client side
        // console.log(redirectLocation); this might be needed on the client side
        React.render(React.createElement(RoutingContext, renderProps), document.getElementById('base'));
      });
    }
  });

  // React.render(React.createElement(RoutingContext, renderProps), $('#base'));
  // React.render(React.createElement(RoutingContext, renderProps), $('#base'));
});