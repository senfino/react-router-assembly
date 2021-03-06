/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-11-07 22:46:37
 */

'use strict';

var $ = require('jquery');

$(function(){
  var logger = require('plain-logger')('main.source');
  var createBrowserHistory = require('history/lib/createBrowserHistory');
  var history = createBrowserHistory();
  var lastRenderedPath = null;

  history.listen(function(location, error){
    logger.log('error');
    logger.log(error);
    logger.log('location');
    logger.log(location);

    if (error) {
      throw error;
    } else {
      var Router = require('react-router');
      var match = Router.match;
      var routesElement = require('$$reactRouterRoutesElement');
      var RoutingContext = Router.RoutingContext;

      match({routes: routesElement, location: location}, function(error, redirectLocation, renderProps){
        var requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        var isomorphicLogic = require('$$reactRouterIsomorphicLogic');
        var clientPropsSet = require('$$reactRouterClientProps')(isomorphicLogic);
        var clientPropsLogic = clientPropsSet.get(requestedRouteParts);
        var _ = require('lodash');
        var clientProps;
        var serverProps = window.serverProps;

        //remove serverProps after initial path changes.
        if(lastRenderedPath !== null && lastRenderedPath !== requestedRouteParts){
          lastRenderedPath = requestedRouteParts;
          window.serverProps = null;
        }

        if(clientPropsLogic){//consider merging this logic with routePropsDownloader

          if(typeof(clientPropsLogic) === 'function'){
            try{
              clientProps = clientPropsLogic({params: renderProps.params});

              if(!Array.isArray(clientProps)){
                throw new Error('client props must be either an array or a function immediately returning an array');
              }
            }catch(error){
              logger.warn(error.message);
            }
          }else if(Array.isArray(clientPropsLogic)){
            clientProps = clientPropsLogic;
          }else{
            throw new Error('client props must be either an array or a function immediately returning an array, got ' + typeof(clientPropsLogic));
          };
        }else{
          clientProps = clientProps || [];
        }

        renderProps.routes.forEach(function(routePart, routePartIndex){
          //merge serverProps too to know on what server-rendered state we are
          if(serverProps){
            _.assign(routePart, serverProps[routePartIndex], clientProps[routePartIndex]);
          }else{
            _.assign(routePart, clientProps[routePartIndex]);
          }
        });

        logger.log('url changed on front-end, rerendering');

        logger.log('renderProps:');
        logger.log(renderProps);
        logger.log('error:');
        logger.log(error);
        logger.log('redirectLocation:');
        logger.log(redirectLocation);

        var ReactDOM = require('react-dom');
        var React = require('react');

        ReactDOM.render(
          React.createElement(
            RoutingContext, 
            _.assign(renderProps, {history: history})//we have to do stuff that Router.Router normally does for us
          ), 
          document.getElementById('base')
        );
      });
    }
  });

  // without the ability to do stuff before rendering a new path:
  // var Router = require('react-router');
  // var ReactDOM = require('react-dom');
  // var routesElement = require('../routing/routes');
  // var React = require('react');
  // ReactDOM.render(React.createElement(Router.Router, {history: createBrowserHistory()}, routesElement), document.getElementById('base'));
});