/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-26 03:05:18
 */

'use strict';

module.exports = function(serverPropsRequest, options){
  let Q = require('q');
  let promise;
  let logger = require('plain-logger')('routePropsDownloader');

  // execute all grabbers and collect props
  if(serverPropsRequest){

    if(typeof serverPropsRequest === 'function'){
      try{
        promise = Q.fcall(serverPropsRequest, options)
          .then(function(result){

            if(!Array.isArray(result)){
              throw new Error('initial data must be returned as an array, even if empty');
            }else{
              return result;
            }
          }, function(error){
            logger.warn(error.message);
          });
      }catch(error){
        logger.warn(error.message);
      }
    }else if(Array.isArray(serverPropsRequest)){
      promise = Q.resolve(serverPropsRequest);
    }else{
      logger.error(serverPropsRequest);
      throw new Error('route initial data logic must ba an array or a function that returns an array');
    }
  }else{
    // do nothing, not all routes need server side initial data
    logger.log('provided routeParts don\'t have props');
    promise = Q.resolve([]);
  }

  return promise;
};