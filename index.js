/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-12-09 17:08:18
 */

'use strict';

var logger = require('plain-logger')('index');
var compiledTemplate;

var modes = {
  BUILD_AND_WATCH: 'BUILD_AND_WATCH',
  BUILD: 'BUILD'
};

function setupTemplate(templatePath){
  let Handlebars = require('handlebars');

  let fs = require('fs');
  let template = fs.readFileSync(templatePath, {encoding: 'utf8'});

  compiledTemplate = Handlebars.compile(template);

  return compiledTemplate;
}

/**
 * @param  {string} clientPropsPath String to module containing grabber for 
 * getting props. Currently only string allowed, not directly function.
 */
function regenerateFrontScript(customOptions){
  logger.log('#regenerateFrontScript()');

  let browserifyInstance;
  let defaults = {
    clientPropsPath: null,
    routesElementPath: null,
    isomorphicLogicPath: null,
    onUpdate: function(){},
    onChange: function(){},
    extraCompress: false,
    publicFilesDirectory: null,
    mode: modes.BUILD
  };
  let _ = require('lodash');
  let options = _.assign({}, defaults, customOptions);

  let clientPropsPath = options.clientPropsPath;
  let routesElementPath = options.routesElementPath;
  let isomorphicLogicPath = options.isomorphicLogicPath;
  let watchify;
  let bundle;

  let browserify = require('browserify');
  let fs;
  let exorcist = require('exorcist');
  let babelify = require('babelify');
  let temporaryFilesDirectory = process.cwd() + '/.react-router-assembly';
  let mkdirp;

  switch(options.mode){
    case modes.BUILD_AND_WATCH:
      watchify = require('watchify');
      browserifyInstance = browserify({
        debug: true,
        cache: {}, 
        packageCache: {},
        plugin: [watchify]
      });
      break;
    case modes.BUILD:
      browserifyInstance = browserify({
        debug: true
      });
      break;
    default:
      throw new Error('mode not supported (' + options.mode + ')');
  }

  // create directory
  mkdirp = require('mkdirp');
  mkdirp.sync(temporaryFilesDirectory);

  browserifyInstance.require(clientPropsPath, {expose: '$$reactRouterClientProps'});
  browserifyInstance.require(routesElementPath, {expose: '$$reactRouterRoutesElement'});
  browserifyInstance.require(isomorphicLogicPath, {expose: '$$reactRouterIsomorphicLogic'});

  // Problem: the following doesn't work because there's an error with browserify-incremental
  // incorrectly resolving exposed modules.
  // browserifyIncremental(browserifyInstance, {cacheFile: temporaryFilesDirectory + '/browserify-cache.json'});

  fs = require('fs');
  mkdirp.sync(options.publicFilesDirectory + '/scripts');
  

  browserifyInstance.add(__dirname + '/public/scripts/main.source.js');

  bundle = function(){
    let stream;
    let output;

    options.onChange();

    output = fs.createWriteStream(options.publicFilesDirectory + '/scripts/main.generated.js');

    stream = browserifyInstance
      .bundle()
      .pipe(exorcist(options.publicFilesDirectory + '/scripts/main.generated.js.map'))
      .pipe(output);

    stream.on('close', options.onUpdate);//let errors bubble up, just handle close
  };

  if(options.extraCompress){
    let envify = require('envify/custom');

    browserifyInstance
      .transform(babelify)
      .transform(envify({
        NODE_ENV: 'production'
      }))
      .transform(require('uglifyify'),{
        global: true//minify module code too, if React has to be shrunk by removing unused code, this is necessary
      });
  }

  browserifyInstance
    .on('update', bundle);

  bundle();
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

function build(customOptions){
  let base = process.env.PWD;
  let isPathOptionKey = function(value, key){
    return key in pathsDefaults;
  };
  let defaults = {
    extraCompress: false,
    publicGeneratedFilesDirectory: base + '/.react-router-assembly',
    onUpdate: null,//use default from regenerateFrontScript,
    onChange: null,//use default from regenerateFrontScript,
    mode: null//use default from regenerateFrontScript
  };
  let pathsDefaults = {
    routesElementPath: __dirname + '/routing/routes.default.js',
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    clientPropsPath: __dirname + '/routing/clientProps.default.js'
  };
  let _ = require('lodash');
  let fromBasePath = function(value){
    let path = require('path');

    return path.resolve(base, value);
  };
  let pathsOptions = _.mapValues(_.pick(customOptions, isPathOptionKey), fromBasePath);
  let options = _.assign({}, defaults, pathsDefaults, customOptions, pathsOptions);

  regenerateFrontScript({
    clientPropsPath: options.clientPropsPath,
    routesElementPath: options.routesElementPath,
    isomorphicLogicPath: options.isomorphicLogicPath,
    extraCompress: options.extraCompress,
    publicFilesDirectory: options.publicGeneratedFilesDirectory,
    onUpdate: options.onUpdate,
    onChange: options.onChange,
    mode: options.mode
  });
}

function attach(customOptions){
  let publicGeneratedFilesDirectory;
  let compiledTemplate;
  let isomorphicLogic;
  let serverPropsGenerator;
  let base = process.env.PWD;
  let _ = require('lodash');
  let defaults = {
    app: null,
    serverPropsGenerator: null,
    additionalTemplateProps: {},
    onComplete: function(){},
    publicGeneratedFilesDirectory: base + '/.react-router-assembly'
  };
  let pathsDefaults = {
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    templatePath: __dirname + '/views/react-page.handlebars',
    routesElementPath: __dirname + '/routing/routes.default.js',
    serverPropsGeneratorPath: __dirname + '/routing/serverPropsGenerator.default.js'
  };
  let isPathOptionKey = function(value, key){
    return key in pathsDefaults;
  };
  let fromBasePath = function(value){
    let path = require('path');

    return path.resolve(base, value);
  };
  let pathsOptions = _.mapValues(_.pick(customOptions, isPathOptionKey), fromBasePath);
  let options = _.assign({}, defaults, pathsDefaults, customOptions, pathsOptions);
  let routesElement = require(options.routesElementPath);

  if(_.isUndefined(options.app)){
    throw new Error('app property is required, should refer to express\'s app');
  }

  isomorphicLogic = require(options.isomorphicLogicPath);

  if(typeof options.serverPropsGenerator === 'function'){
    serverPropsGenerator = options.serverPropsGenerator(isomorphicLogic);
  }else if(typeof options.serverPropsGeneratorPath === 'string'){
    serverPropsGenerator = require(options.serverPropsGeneratorPath)(isomorphicLogic);
  }else{
    throw new Error('serverPropsGenerator (function returning serializable-key-set) or serverPropsGeneratorPath (string) need to be specified');
  }

  compiledTemplate = setupTemplate(options.templatePath);

  addRoutes({
    app: options.app,
    routesElement: routesElement,
    serverPropsGenerator: serverPropsGenerator,
    additionalTemplateProps: options.additionalTemplateProps,
    compiledTemplate: compiledTemplate,
    publicFilesDirectory: options.publicGeneratedFilesDirectory
  });

  options.onComplete();
}

module.exports = {
  build: build,
  attach: attach,
  modes: modes
};