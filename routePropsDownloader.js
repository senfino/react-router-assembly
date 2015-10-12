/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:19:05
 */

'use strict';

module.exports = function(serverPropsRequest, routeInformation){
  let Q = require('q');
  let promise;
  let logger = require('plain-logger')('routePropsDownloader');

  // execute all grabbers and collect props
  if(serverPropsRequest !== null){

    if(typeof serverPropsRequest === 'function'){
      try{
        promise = Q.fcall(serverPropsRequest, routeInformation)
          .then(function(result){

            if(typeof result !== 'object'){
              throw new Error('initial data must be returned as an object, even if empty');
            }else{
              return result;
            }
          }, function(error){
            logger.warn(error.message);
          });
      }catch(error){
        logger.warn(error.message);
      }
    }else if(typeof serverPropsRequest === 'object'){
      promise = Q.resolve(serverPropsRequest);
    }else{
      logger.error(serverPropsRequest);
      throw new Error('route initial data logic must ba a plain object or a function that returns an object');
    }
  }else{
    // do nothing, not all routes need server side initial data
    logger.log('provided routeParts don\'t have props');
    promise = Q.resolve({});
  }

  return promise;
};