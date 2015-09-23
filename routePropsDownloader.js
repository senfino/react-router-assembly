module.exports = function(serverPropsRequest, routeInformation){
  var Q = require('q');
  var promise;

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
            console.warn(error.message);
          });
      }catch(error){
        console.warn(error.message);
      }
    }else if(typeof serverPropsRequest === 'object'){
      promise = Q.resolve(serverPropsRequest);
    }else{
      console.error(serverPropsRequest);
      throw new Error('route initial data logic must ba a plain object or a function that returns an object');
    }
  }else{
    // do nothing, not all routes need server side initial data
    console.log('provided routeParts don\'t have props');
    promise = Q.resolve({});
  }

  return promise;
};