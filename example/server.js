let assembly;
let routesElementPath;
let isomorphicLogicPath;
let serverInstance = null;
let restartOnNextShutdown = false;
let paths = require('./sharedPaths');

function restartServer(){
  let control;

  // Restart the server automatically after shutdown completes
  // only if the shutdown was "natural", eg. the server
  // shutdown gracefully. If it shutdown due to an error, don't
  // try to start it again, just wait for next onUpdate from
  // assembly.
  if(serverInstance !== null){
    restartOnNextShutdown = true;
    serverInstance.destroy();
  }else{
    control = require('server-creator');

    // fork here
    serverInstance = control.create({
      path: './express',
      onOffline: function(){
        serverInstance = null;

        if(restartOnNextShutdown){
          restartOnNextShutdown = false;
          restartServer();
        }
      }
    });
  }
}

assembly = require('../index');

assembly.build({
  clientPropsPath: './routing/clientProps',

  //create a more complicated URL structure as an example
  routesElementPath: paths.routesElementPath,

  //create example methods that can be used client- and server-side
  isomorphicLogicPath: paths.isomorphicLogicPath,
  extraCompress: process.env.NODE_ENV,

  // do an initial JavaScript build and later watch JavaScript for changes
  // and rebuild when changes are spotted
  mode: assembly.modes.BUILD_AND_WATCH,
  onChange: function(){
    console.log('scripts changed');
  },
  onUpdate: function(attach){
    console.log('scripts updated');

    // restarting of the Express server is up to the developer
    // react-router-assembly only attaches paths for rendering React
    // client- and server-side with assembly.attach (express.js) 
    // and regenerates scripts with assembly.build
    restartServer();
  }
});