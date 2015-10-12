/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:20:15
 */

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