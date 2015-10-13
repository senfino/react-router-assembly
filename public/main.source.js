/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-13 22:53:17
 */

'use strict';

let $ = require('jquery');

$(function(){
  let logger = require('plain-logger')('main.source');
  let createBrowserHistory = require('history/lib/createBrowserHistory');
  let history = createBrowserHistory();

  history.listen(function(location, error){
    logger.log('error');
    logger.log(error);
    logger.log('location');
    logger.log(location);

    if (error) {
      throw error;
    } else {
      let Router = require('react-router');
      let match = Router.match;
      // let routesElement = require('../routing/routes');
      let routesElement = require('$$reactRouterRoutesElement');
      let RoutingContext = Router.RoutingContext;

      match({routes: routesElement, location: location}, function(error, redirectLocation, renderProps){
// routes, clientPropsGenerator
        let routePropsDownloader = require('../routePropsDownloader');
        let requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        let isomorphicLogic = require('$$reactRouterIsomorphicLogic');
        // let clientPropsGenerator = require('../routing/clientPropsGenerator')(isomorphicLogic);
        let clientPropsGenerator = require('$$reactRouterClientPropsGenerator')(isomorphicLogic);

        routePropsDownloader(
          clientPropsGenerator.get(requestedRouteParts), 
          renderProps
        )
        .then(
          function(clientPropsForRoute){
            let _ = require('lodash');

            renderProps.routes.forEach(function(routePart, routePartIndex){
              _.assign(routePart, clientPropsForRoute[routePartIndex]);
            });

            logger.log('url changed on front-end, rerendering');

            logger.log('renderProps:');
            logger.log(renderProps);
            logger.log('error:');
            logger.log(error);
            logger.log('redirectLocation:');
            logger.log(redirectLocation);

            let ReactDOM = require('react-dom');
            let React = require('react');

            ReactDOM.render(
              React.createElement(
                RoutingContext, 
                _.assign(renderProps, {history: history})//we have to do stuff that Router.Router normally does for us
              ), 
              document.getElementById('base')
            );
          },
          function(error){
            throw error;
            // also, cancel old requests when switching between routes fast.
          }
        )
        .done();
      });
    }
  });

  // without the ability to do stuff before rendering a new path:
  // let Router = require('react-router');
  // let ReactDOM = require('react-dom');
  // let routesElement = require('../routing/routes');
  // let React = require('react');
  // ReactDOM.render(React.createElement(Router.Router, {history: createBrowserHistory()}, routesElement), document.getElementById('base'));
});