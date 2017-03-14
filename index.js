var logger = require('plain-logger')('index');
var compiledTemplate;

var modes = {
  BUILD_AND_WATCH: 'BUILD_AND_WATCH',
  BUILD: 'BUILD'
};

var swallowError = function(error) {
  console.error(error.toString());

  this.emit('end');
};

function setupTemplate(templatePath){
  let Handlebars = require('handlebars');

  let fs = require('fs');
  let template = fs.readFileSync(templatePath, {encoding: 'utf8'});

  compiledTemplate = Handlebars.compile(template);

  return compiledTemplate;
}






function undefinedCustomizer(value, other){
  let _ = require('lodash');

  return _.isUndefined(other) ? value : other;
}






function regenerateFrontScript(customOptions){
  logger.log('#regenerateFrontScript()');

  let browserifyInstance;
  let defaults = {
    clientPropsPath: null,
    routesElementPath: null,
    isomorphicLogicPath: null,
    onUpdate: function(){},
    onChange: function(){},
    cwd: './',
    extraCompress: false,
    publicFilesDirectory: null,
    mode: modes.BUILD
  };
  let _ = require('lodash');
  let path = require('path');

  if(customOptions.cwd !== undefined){

    if(customOptions.publicFilesDirectory !== undefined){
      customOptions.publicFilesDirectory = path.resolve(customOptions.cwd, customOptions.publicFilesDirectory);
    }else{
      customOptions.publicFilesDirectory = path.resolve(customOptions.cwd, defaults.publicFilesDirectory);
    }
  }

  let options = _.assign({}, defaults, customOptions, undefinedCustomizer);

  let clientPropsPath = options.clientPropsPath;
  let routesElementPath = options.routesElementPath;
  let isomorphicLogicPath = options.isomorphicLogicPath;
  let watchify;
  let bundle;

  let browserify = require('browserify');
  let fs;
  let exorcist = require('exorcist');
  let babelify = require('babelify');
  // let temporaryFilesDirectory = process.cwd() + '/.react-router-assembly';
  let mkdirp;

  switch(options.mode){
    case modes.BUILD_AND_WATCH:
      watchify = require('watchify');
      browserifyInstance = browserify({
        debug: true,
        cache: {}, 
        packageCache: {},
        basedir: options.cwd,
        plugin: [watchify]
      });
      break;
    case modes.BUILD:
      browserifyInstance = browserify({
        debug: true,
        basedir: options.cwd
      });
      break;
    default:
      throw new Error('mode not supported (' + options.mode + ')');
  }

  // create directory
  mkdirp = require('mkdirp');
  // mkdirp.sync(temporaryFilesDirectory);

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
      .on('error', swallowError)
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
        //minify module code too, if React has to be shrunk by 
        // removing unused code, this is necessary
        global: true
      });
  }

  browserifyInstance
    .on('update', bundle);

  bundle();
}







function createCookieManager(request, response){
  let cookiesManager;

  if(typeof request.cookies === 'object'){
    cookiesManager = {
      setJson(key, newValue){
        this.set(key, JSON.stringify(newValue));
      },
      getJson(key){
        let cookieValue = this.get(key);

        if(typeof cookieValue === 'undefined'){
          return undefined;
        }else{

          try{
            return JSON.parse(cookieValue);
          }catch(error){
            return undefined;
          }
        }
      },
      set(key, newValue){
        response.cookies[key] = newValue;
      },
      get(key){
        return request.cookies[key];
      },
      all(){
        return request.cookies;
      }
    };//cookiesManager needs to be created separately for every request, as it need request and response variables to work
  }else{
    cookiesManager = null;
  }

  return cookiesManager;
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
  let options = _.assign({}, defaults, customOptions, undefinedCustomizer);

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
        let routePropsDownloader = require(__dirname + '/routePropsDownloader');
        let cookiesManager = createCookieManager(request, response);

        logger.log('getting props on the server for ' + JSON.stringify(requestedRouteParts));






        routePropsDownloader(serverPropsGenerator.get(requestedRouteParts), {params: renderProps.params, cookiesManager: cookiesManager})
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
              _.assign(routePart, serverPropsForRoute[routePartIndex], undefinedCustomizer);
            });

            ReactDOMServer = require('react-dom/server');
            reactDOMString = ReactDOMServer.renderToString(React.createElement(RoutingContext, renderProps));

            logger.log('rendering handlebars response with react embedded');

            handlebarsProps = _.assign({
              content: reactDOMString,
              serverProps: JSON.stringify(serverPropsForRoute)
            }, additionalTemplateProps, undefinedCustomizer);
            
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






/**
 * Builds or watches and rebuilds JavaScript for React.
 */
function build(customOptions){
  let defaults = {
    extraCompress: false,
    // cwd: undefined,//use default from regenerateFrontScript,
    // onUpdate: undefined,//use default from regenerateFrontScript,
    // onChange: undefined,//use default from regenerateFrontScript,
    // mode: undefined//use default from regenerateFrontScript
    routesElementPath: __dirname + '/routing/routes.default.js',
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    clientPropsPath: __dirname + '/routing/clientProps.default.js',
    publicGeneratedFilesDirectory:  '.react-router-assembly'
  };

  let _ = require('lodash');
  
  let options = _.assign({}, defaults, customOptions, undefinedCustomizer);

  regenerateFrontScript({
    clientPropsPath: options.clientPropsPath,
    routesElementPath: options.routesElementPath,
    isomorphicLogicPath: options.isomorphicLogicPath,
    extraCompress: options.extraCompress,
    publicFilesDirectory: options.publicGeneratedFilesDirectory,
    onUpdate: options.onUpdate,
    onChange: options.onChange,
    cwd: options.cwd,
    mode: options.mode
  });
}






/**
 * Attaches paths for rendering React to Express.
 */
function attach(customOptions){
  let publicGeneratedFilesDirectory;
  let compiledTemplate;
  let isomorphicLogic;
  let serverPropsGenerator;
  // let base = process.env.PWD;
  let _ = require('lodash');
  let defaults = {
    app: null,
    cwd: './',
    serverPropsGenerator: null,
    additionalTemplateProps: {},
    onComplete: function(){},
    // publicGeneratedFilesDirectory: base + '/.react-router-assembly'
    publicGeneratedFilesDirectory: '.react-router-assembly',
    isomorphicLogicPath: __dirname + '/routing/isomorphicLogic.default.js',
    templatePath: __dirname + '/views/react-page.handlebars',
    routesElementPath: __dirname + '/routing/routes.default.js',
    serverPropsGeneratorPath: __dirname + '/routing/serverPropsGenerator.default.js'
  };

  // let pathsDefaults = {
  // };
  // let isPathOptionKey = function(value, key){
  //   return key in pathsDefaults;
  // };
  // let fromBasePath = function(value){
  //   let path = require('path');

  //   return path.resolve(base, value);
  // };
  // let pathsOptions = _.mapValues(_.pick(customOptions, isPathOptionKey), fromBasePath);
  // let options = _.assign({}, defaults, pathsDefaults, customOptions, pathsOptions, undefinedCustomizer);
  let options = _.assign({}, defaults, customOptions, undefinedCustomizer);

  let path = require('path');
  let routesElement = require(path.resolve(options.cwd, options.routesElementPath));

  if(_.isUndefined(options.app)){
    throw new Error('app property is required, should refer to express\'s app');
  }

  isomorphicLogic = require(path.resolve(options.cwd, options.isomorphicLogicPath));

  if(typeof options.serverPropsGenerator === 'function'){
    serverPropsGenerator = options.serverPropsGenerator(isomorphicLogic);
  }else if(typeof options.serverPropsGeneratorPath === 'string'){
    serverPropsGenerator = require(path.resolve(options.cwd, options.serverPropsGeneratorPath))(isomorphicLogic);
  }else{
    throw new Error('serverPropsGenerator (function returning serializable-key-set) or serverPropsGeneratorPath (string) need to be specified');
  }

  compiledTemplate = setupTemplate(path.resolve(options.cwd, options.templatePath));

  addRoutes({
    app: options.app,
    routesElement: routesElement,
    serverPropsGenerator: serverPropsGenerator,
    additionalTemplateProps: options.additionalTemplateProps,
    compiledTemplate: compiledTemplate,
    publicFilesDirectory: path.resolve(options.cwd, options.publicGeneratedFilesDirectory)
  });

  options.onComplete();
}

module.exports = {
  build: build,
  attach: attach,
  modes: modes
};