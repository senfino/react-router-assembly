let express = require('express');
let app = express();
let assembly = require('../index');
let control = require('server-creator');
let paths = require('./sharedPaths');

function setupRest(){
  let exphbs;

  app.set('views', __dirname + '/views');
  exphbs = require('express-handlebars');
  app.engine('handlebars', exphbs());
  app.set('view engine', 'handlebars');

  app.use(express.static('public'));

  // this route is not specific to react but useful
  // for handling server errors outside react
  app.use(function(error, request, response, next) {
    console.error(error.stack);
    response.status(500);
    response.render('server-error.handlebars', {
      error: error
    });
  });

  let server = app.listen(80, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

    control.serverReady(process);
  });
}

assembly.attach({
  app: app,
  routesElementPath: paths.routesElementPath,
  serverPropsGeneratorPath: './routing/serverPropsGenerator',
  isomorphicLogicPath: paths.isomorphicLogicPath,

  onComplete: setupRest
});