/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-12-09 17:22:36
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-12-21 14:31:37
 */
'use strict';

let express = require('express');
let app = express();
let assembly = require('../index');
let control = require('server-creator');

function setupRest(){
  let exphbs;

  app.set('views', __dirname + '/views');
  exphbs = require('express-handlebars');
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

    control.serverReady(process);
  });
}

let routesElementPath = './routing/routes';
let isomorphicLogicPath = './routing/isomorphicLogic';

assembly.attach({
  app: app,
  routesElementPath: routesElementPath,
  serverPropsGeneratorPath: './routing/serverPropsGenerator',
  isomorphicLogicPath: isomorphicLogicPath,

  onComplete: setupRest
});