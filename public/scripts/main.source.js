/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 23:14:09
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
      let routesElement = require('$$reactRouterRoutesElement');
      let RoutingContext = Router.RoutingContext;

      match({routes: routesElement, location: location}, function(error, redirectLocation, renderProps){
        let requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        let isomorphicLogic = require('$$reactRouterIsomorphicLogic');
        let clientPropsSet = require('$$reactRouterClientProps')(isomorphicLogic);
        let clientPropsLogic = clientPropsSet.get(requestedRouteParts);
        let _ = require('lodash');
        let clientProps;
        let serverProps = window.serverProps;

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
          _.assign(routePart, serverProps[routePartIndex], clientProps[routePartIndex]);
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