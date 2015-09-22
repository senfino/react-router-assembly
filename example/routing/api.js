function api(logic){
  var logger = require('plain-logger')('api', 'yellow');
  var app = require('express')();

  app.get('/posts', function(request, response){
    logger.log('/posts');

    response('asd');
  });

  return app
}

module.exports = api;