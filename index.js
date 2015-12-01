/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-11-30 22:25:19
 */

'use strict';

var logger = require('plain-logger')('index');
var compiledTemplate;

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
    doneCallback: null,
    compressFrontScript: false,
    publicFilesDirectory: null
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  let clientPropsPath = options.clientPropsPath;
  let routesElementPath = options.routesElementPath;
  let isomorphicLogicPath = options.isomorphicLogicPath;
  let doneCallback = options.doneCallback;

  let browserify = require('browserify');
  let browserifyInstance = browserify({
    debug: true,
    cache: {}, 
    packageCache: {}, 
    fullPaths: true
  });
  let fs;
  let output;
  let browserifyStream;
  let exorcist = require('exorcist');
  let babelify = require('babelify');
  let browserifyIncremental = require('browserify-incremental');
  let temporaryFilesDirectory = process.cwd() + '/.react-router-assembly';
  let mkdirp;

  logger.log('#regenerateFrontScript()');

  // create directory
  mkdirp = require('mkdirp');
  mkdirp.sync(temporaryFilesDirectory);

  browserifyIncremental(browserifyInstance, {cacheFile: temporaryFilesDirectory + '/browserify-cache'});

  browserifyInstance.require(clientPropsPath, {expose: '$$reactRouterClientProps'});
  browserifyInstance.require(routesElementPath, {expose: '$$reactRouterRoutesElement'});
  browserifyInstance.require(isomorphicLogicPath, {expose: '$$reactRouterIsomorphicLogic'});

  fs = require('fs');
  mkdirp.sync(options.publicFilesDirectory + '/scripts');
  output = fs.createWriteStream(options.publicFilesDirectory + '/scripts/main.generated.js');

  browserifyInstance.add(__dirname + '/public/scripts/main.source.js');

  if(options.compressFrontScript){
    let envify = require('envify/custom');

    browserifyStream = browserifyInstance
    .transform(babelify)
    .transform(envify({
      NODE_ENV: 'production'
    }))
    .transform(require('uglifyify'),{
      global: true//minify module code too, if React has to be shrunk by removing unused code, this is necessary
    })
    .bundle()
    .pipe(exorcist(options.publicFilesDirectory + '/scripts/main.generated.js.map'))
    .pipe(output);
  }else{
    browserifyStream = browserifyInstance
    .bundle()
    .pipe(exorcist(options.publicFilesDirectory + '/scripts/main.generated.js.map'))
    .pipe(output);
  }
  
  browserifyStream.on('close', doneCallback);//let errors bubble up, just handle close
}

function addRoutes(customOptions){
  let defaults = {
    app: null,
    routesElement: null,
    serverPropsGenerator: null,
    additionalTemplateProps: null,
    compiledTemplate: null,
    publicFilesDirectory: null
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
  app.use(express.static(options.publicFilesDirectory));
  logger.log('serving static files for react at ' + options.publicFilesDirectory);
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

        routePropsDownloader(serverPropsGenerator.get(requestedRouteParts), {params: renderProps.params})
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
    additionalTemplateProps: {},
    serverPropsGenerator: null,
    compressFrontScript: false
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

    return path.resolve(base, value);
  };
  let hasPathKey = function(value, key){
    return key in pathsDefaults;
  };
  let pathsOptions = _.mapValues(_.pick(customOptions, hasPathKey), fromBase);
  let options = _.assign({}, defaults, pathsDefaults, customOptions, pathsOptions);

  let routesElement;
  let isomorphicLogic;
  let serverPropsGenerator;
  let publicGeneratedFilesDirectory;
  let mkdirp;

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

  if(typeof options.serverPropsGenerator === 'function'){
    serverPropsGenerator = options.serverPropsGenerator(isomorphicLogic);
  }else if(typeof options.serverPropsGeneratorPath === 'string'){
    serverPropsGenerator = require(options.serverPropsGeneratorPath)(isomorphicLogic);
  }else{
    throw new Error('serverPropsGenerator (function returning serializable-key-set) or serverPropsGeneratorPath (string) need to be specified');
  }

  publicGeneratedFilesDirectory = process.cwd() + '/.react-router-assembly/public-generated';

  regenerateFrontScript({
    clientPropsPath: options.clientPropsPath,
    routesElementPath: options.routesElementPath,
    isomorphicLogicPath: options.isomorphicLogicPath,
    compressFrontScript: options.compressFrontScript,
    publicFilesDirectory: publicGeneratedFilesDirectory,
    doneCallback: function(){
      let compiledTemplate = setupTemplate(options.templatePath);

      addRoutes({
        app: options.app,
        routesElement: routesElement,
        serverPropsGenerator: serverPropsGenerator,
        additionalTemplateProps: options.additionalTemplateProps,
        compiledTemplate: compiledTemplate,
        publicFilesDirectory: publicGeneratedFilesDirectory
      });

      options.doneCallback();
    }
  });
};

module.exports = addReactRoute;