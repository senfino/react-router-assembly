#!/usr/bin/env node

/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-13 22:42:46
 */

'use strict';

let express = require('express');
let app = express();
let exphbs  = require('express-handlebars');
let attachReactRoute = require('../index');
let isomorphicLogic = require('./routing/isomorphicLogic');

function setupRest(){
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

// views and templates setup
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
// let serverPropsGenerator = require('./routing/serverPropsGenerator')(isomorphicLogic);
attachReactRoute({
  app: app,
  // routesElementPath: '',
  // serverPropsGeneratorPath: '',
  // isomorphicLogicPath: '',
  // clientPropsGeneratorPath: '',
  doneCallback: setupRest
  // additionalTemplateProps: {pageTitle: 'This is an example server'}
});