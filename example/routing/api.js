/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:18:48
 */

'use strict';

function api(logic){
  var logger = require('plain-logger')('api');
  var app = require('express')();

  app.get('/posts', function(request, response){
    logger.log('/posts');

    response('asd');
  });

  return app
}

module.exports = api;