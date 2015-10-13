/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-13 22:51:58
 */

'use strict';

let logger = require('plain-logger')('index');

function regenerateFrontScript(customOptions){
  let defaults = {
    clientPropsGeneratorPath: null,
    routesElementPath: null,
    isomorphicLogicPath: null,
    doneCallback: null
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  let clientPropsGeneratorPath = options.clientPropsGeneratorPath;
  let routesElementPath = options.routesElementPath;
  let isomorphicLogicPath = options.isomorphicLogicPath;
  let doneCallback = options.doneCallback;

  let browserify = require('browserify');
  let browserifyInstance = browserify({
    debug: true
  });
  let fs;
  let output;
  let browserifyStream;

  logger.log('#regenerateFrontScript()');

  browserifyInstance.require(clientPropsGeneratorPath, {expose: '$$reactRouterClientPropsGenerator'});
  browserifyInstance.require(routesElementPath, {expose: '$$reactRouterRoutesElement'});
  browserifyInstance.require(isomorphicLogicPath, {expose: '$$reactRouterIsomorphicLogic'});

  fs = require('fs');
  output = fs.createWriteStream(__dirname + '/public/main.generated.js');

  browserifyInstance.add(__dirname + '/public/main.source.js');

  browserifyStream = browserifyInstance.bundle().pipe(output);
  browserifyStream.on('close', doneCallback);
  // browserifyStream.on('error', function(){
  //   logger.log('error');
  // });
}

function addRoutes(customOptions){
  let defaults = {
    app: null,
    routesElement: null,
    serverPropsGenerator: null,
    additionalTemplateProps: null
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  let app = options.app;
  let routesElement = options.routesElement;
  let serverPropsGenerator = options.serverPropsGenerator;
  let additionalTemplateProps = options.additionalTemplateProps;

  /*
  Add front-end files for rendering React pages.
   */
  let express = require('express');
  app.use(express.static(__dirname + '/public'));
  logger.log('serving static files for react at ' + __dirname + '/public');
  /*
  This should be the last route. It catches everything and tries to render a 
  React page. React will decide whether to display 404 or expected content.
  Static files in particular should be handled before this route.
  */
  app.get('*', function(request, response, next) {
    let location = request.url;
    let Router = require('react-router');
    let match = Router.match;
    let React = require('react');
    let _ = require('lodash');
    let logger = require('plain-logger')('react-router-assembly');

    match({routes: routesElement, location: location}, function(error, redirectLocation, renderProps){
      logger.log('renderProps:\n' + JSON.stringify(renderProps, null, 2));

      if (redirectLocation){
        response.redirect(301, redirectLocation.pathname + redirectLocation.search);
      }else if(error){
        response.status(500).send(error.message);
      }else if(renderProps == null){ // let react handle this case as well
        response.status(404).send('Not found');
      }else{
        let requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        let SerializableKeySet = require('serializable-key-set');
        let routePropsDownloader = require('./routePropsDownloader');

        logger.log('getting props on the server for ' + JSON.stringify(requestedRouteParts));

        routePropsDownloader(
          serverPropsGenerator.get(requestedRouteParts), 
          renderProps
        )
        .then(function(serverPropsForRoute){
          try{
            let _ = require('lodash');
            let RoutingContext = Router.RoutingContext;
            let React = require('react');
            let reactDOMString;
            let ReactDOMServer;

            logger.log('rendering react components on the server to string');

            renderProps.routes.forEach(function(routePart, routePartIndex){
              _.assign(routePart, {serverProps: serverPropsForRoute[routePartIndex]});
            });

            ReactDOMServer = require('react-dom/server');
            reactDOMString = ReactDOMServer.renderToString(React.createElement(RoutingContext, renderProps));

            logger.log('rendering handlebars response with react embedded');

            response.render('react-page.handlebars', _.assign({
              content: reactDOMString,
              serverProps: JSON.stringify(serverPropsForRoute)
            }, additionalTemplateProps));
          }catch(error){
            next(error);
          }
        }, function(error){

          if(error instanceof Error){
            next(error);
          }else{
            next(new Error('could not retrieve all state values, try again'));
          }
        })
        .done();
      }
    });
  });
}

function addReactRoute(customOptions){
  let defaults = {
    app: null,
    routesElementPath: __dirname + '/routing/routes.default.js',
    serverPropsGeneratorPath: __dirname + '/routing/serverPropsGenerator.default.js',
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    doneCallback: null,
    clientPropsGeneratorPath: __dirname + '/routing/clientPropsGenerator.default.js',
    additionalTemplateProps: {}
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  /*
  Generate front-end code using browserify when the server is launched so all JS 
  files can be merged into one and the setup of react-router-assembly is simpler.
  Consider making this non-compulsory in the future.
   */
  let routesElement = require(options.routesElementPath);
  let isomorphicLogic = require(options.isomorphicLogicPath);
  let serverPropsGenerator = require(options.serverPropsGeneratorPath)(isomorphicLogic);
  regenerateFrontScript({
    clientPropsGeneratorPath: options.clientPropsGeneratorPath,
    routesElementPath: options.routesElementPath,
    isomorphicLogicPath: options.isomorphicLogicPath,
    doneCallback: function(){
      addRoutes({
        app: options.app,
        routesElement: routesElement,
        serverPropsGenerator: serverPropsGenerator,
        additionalTemplateProps: options.additionalTemplateProps
      });

      options.doneCallback();
    }
  });
};

module.exports = addReactRoute;