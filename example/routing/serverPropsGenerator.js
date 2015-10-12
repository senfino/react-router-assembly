/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-11 18:20:23
 */

'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();
let logger = require('plain-logger')('serverPropsGenerator');

module.exports = function(logic){
  grabber.add(['/', 'apples/:appleType'], function(route){
    logger.log("serverPropsGenerator for ['/', 'apples/:appleType']");

    return [
      {
        exampleKey: 'some example value'
      },
      {
        initialList: ['red apples', 'green apples', 'yellow apples']
      }
    ];
  });

  return grabber;
}