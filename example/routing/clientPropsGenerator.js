/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:20:11
 */

'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();
let logger = require('plain-logger')('clientPropsGenerator');

module.exports = function(logic){
  grabber.add(['/', 'apples/:appleType'], function(route){
    logger.log("clientPropsGenerator for ['/', 'apples/:appleType']");

    return [
      null,
      {
        initialSelection: 'red'
      }
    ];
  });

  return grabber;
}