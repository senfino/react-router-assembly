#!/usr/bin/env node

/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-12-09 17:00:09
 */

'use strict';

let express = require('express');
let app = express();
let exphbs;
let assembly;

function setupRest(){
  app.set('views', __dirname + '/views');
  exphbs  = require('express-handlebars');
  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');

  app.use(express.static('public'));

  // this route is not specific to react but useful
  app.use(function(error, request, response, next) {
    console.error(error.stack);
    response.status(500);
    response.render('server-error.handlebars', {
      error: error
    });
  });

  let server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}

// attachReactRoute({
//   app: app,
//   routesElementPath: './routing/routes',
//   serverPropsGeneratorPath: './routing/serverPropsGenerator',
//   isomorphicLogicPath: './routing/isomorphicLogic',
//   clientPropsPath: './routing/clientProps',
//   compressFrontScript: process.env.NODE_ENV,

//   doneCallback: setupRest
// });

assembly = require('../index');

assembly.build({
  clientPropsPath: './routing/clientProps',
  routesElementPath: './routing/routes',
  isomorphicLogicPath: './routing/isomorphicLogic',
  extraCompress: process.env.NODE_ENV,
  mode: assembly.modes.BUILD_AND_WATCH,
  onChange: function(){
    console.log('scripts changed');
  },
  onUpdate: function(attach){
    console.log('scripts updated');
  }
});

// assembly.attach({
//   // app: options.app,
//   //       routesElement: routesElement,
//   //       serverPropsGenerator: serverPropsGenerator,
//   //       additionalTemplateProps: options.additionalTemplateProps,//not used here but possible
//   //       compiledTemplate: compiledTemplate,//not used here but possible
//   //       publicFilesDirectory: publicGeneratedFilesDirectory//not used here but possible
//   app: app,
//   routesElementPath: ,
//   serverPropsGeneratorPath: ,
//   onComplete: 
// });