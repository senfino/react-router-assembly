/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 21:56:06
 */

'use strict';

let logger = require('plain-logger')('index');
let compiledTemplate;

function setupTemplate(templatePath){
  let Handlebars = require('handlebars');

  let fs = require('fs');
  let template = fs.readFileSync(templatePath, {encoding: 'utf8'});

  compiledTemplate = Handlebars.compile(template);

  return compiledTemplate;
}

function regenerateFrontScript(customOptions){
  let defaults = {
    clientPropsPath: null,
    routesElementPath: null,
    isomorphicLogicPath: null,
    doneCallback: null
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  let clientPropsPath = options.clientPropsPath;
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

  browserifyInstance.require(clientPropsPath, {expose: '$$reactRouterClientProps'});
  browserifyInstance.require(routesElementPath, {expose: '$$reactRouterRoutesElement'});
  browserifyInstance.require(isomorphicLogicPath, {expose: '$$reactRouterIsomorphicLogic'});

  fs = require('fs');
  output = fs.createWriteStream(__dirname + '/public/scripts/main.generated.js');

  browserifyInstance.add(__dirname + '/public/scripts/main.source.js');

  browserifyStream = browserifyInstance.bundle().pipe(output);
  browserifyStream.on('close', doneCallback);//let errors bubble up, just handle close
}

function addRoutes(customOptions){
  let defaults = {
    app: null,
    routesElement: null,
    serverPropsGenerator: null,
    additionalTemplateProps: null,
    compiledTemplate: null
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

    logger.log('location:');
    logger.log(location);

    match({routes: routesElement, location: location}, function(error, redirectLocation, renderProps){
      logger.log('error:');
      logger.log(error);
      logger.log('redirectLocation:');
      logger.log(redirectLocation);
      logger.log('renderProps:\n' + JSON.stringify(renderProps, null, 2));

      if(error){
        response.status(500).send(error.message);
      }else if (redirectLocation){
        response.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }else if(!renderProps){ // let react handle this case as well
        response.status(404).send('Not found');
      }else{
        let requestedRouteParts = renderProps.routes.map(function(route){return route.path});
        let SerializableKeySet = require('serializable-key-set');
        let routePropsDownloader = require('./routePropsDownloader');

        logger.log('getting props on the server for ' + JSON.stringify(requestedRouteParts));

        routePropsDownloader(serverPropsGenerator.get(requestedRouteParts))
        .then(function(serverPropsForRoute){
          try{
            let _ = require('lodash');
            let RoutingContext = Router.RoutingContext;
            let React = require('react');
            let reactDOMString;
            let ReactDOMServer;
            let handlebarsProps;

            logger.log('rendering react components on the server to string');

            renderProps.routes.forEach(function(routePart, routePartIndex){
              _.assign(routePart, serverPropsForRoute[routePartIndex]);
            });

            ReactDOMServer = require('react-dom/server');
            reactDOMString = ReactDOMServer.renderToString(React.createElement(RoutingContext, renderProps));

            logger.log('rendering handlebars response with react embedded');

            handlebarsProps = _.assign({
              content: reactDOMString,
              serverProps: JSON.stringify(serverPropsForRoute)
            }, additionalTemplateProps);
            
            response.send(options.compiledTemplate(handlebarsProps));
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
  let base = process.env.PWD; 
  let defaults = {
    app: null,
    doneCallback: null,
    additionalTemplateProps: {}
  };
  let pathsDefaults = {
    routesElementPath: __dirname + '/routing/routes.default.js',
    serverPropsGeneratorPath: __dirname + '/routing/serverPropsGenerator.default.js',
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    clientPropsPath: __dirname + '/routing/clientProps.default.js',
    templatePath: __dirname + '/views/react-page.handlebars'
  };
  let _ = require('lodash');
  let fromBase = function(value){
    let path = require('path');

    return path.join(base, value);
  };
  let hasPathKey = function(value, key){
    return key in pathsDefaults;
  };
  let pathsOptions = _.mapValues(_.pick(customOptions, hasPathKey), fromBase);
  let options = _.assign({}, defaults, pathsDefaults, customOptions, pathsOptions);

  let routesElement;
  let isomorphicLogic;
  let serverPropsGenerator;

  if(_.isUndefined(options.app)){
    throw new Error('app property is required, should refer to express\'s app');
  }

  if(_.isUndefined(options.doneCallback)){
    throw new Error('doneCallback property is required');
  }
  
  // Generate front-end code using browserify when the server is launched so all JS 
  // files can be merged into one and the setup of react-router-assembly is simpler.
  // Consider making this non-compulsory in the future.
  routesElement = require(options.routesElementPath);
  isomorphicLogic = require(options.isomorphicLogicPath);
  serverPropsGenerator = require(options.serverPropsGeneratorPath)(isomorphicLogic);

  regenerateFrontScript({
    clientPropsPath: options.clientPropsPath,
    routesElementPath: options.routesElementPath,
    isomorphicLogicPath: options.isomorphicLogicPath,
    doneCallback: function(){
      let compiledTemplate = setupTemplate(options.templatePath);

      addRoutes({
        app: options.app,
        routesElement: routesElement,
        serverPropsGenerator: serverPropsGenerator,
        additionalTemplateProps: options.additionalTemplateProps,
        compiledTemplate: compiledTemplate
      });

      options.doneCallback();
    }
  });
};

module.exports = addReactRoute;