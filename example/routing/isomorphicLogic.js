'use strict';

// Put all initiation logic here, it will be reused on the server and client.

function Logic(){

  // var configuration = require('determine-configuration')();

  // if(configuration === null){
  //   throw new Error('no configuration');
  // }
}

Logic.prototype = {
  // getApiClient: function(){
  //   return this._APIClientInstance;
  // }
};

function logicBuilder(){
  return new Logic();
};

module.exports = logicBuilder;