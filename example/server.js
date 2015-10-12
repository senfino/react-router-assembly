#!/usr/bin/env node

/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:19:26
 */

'use strict';

let express = require('express');
let app = express();
let exphbs  = require('express-handlebars');
let attachReactRoute = require('../index');
let routes = require('./routing/routes');
let isomorphicLogic = require('./routing/isomorphicLogic');
let serverPropsGenerator = require('./routing/serverPropsGenerator')(isomorphicLogic);

// views and templates setup
app.set('views', __dirname + '/views');
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

attachReactRoute(
  app, 
  routes, 
  serverPropsGenerator, 
  {pageTitle: 'This is an example server'}
);

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