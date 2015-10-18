/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 23:30:33
 */

'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();
let logger = require('plain-logger')('clientPropsGenerator');

module.exports = function(logic){
  grabber.add(['/', '*'], function(route){
    return [
      {
        subpage: 'not found'
      },
    ];
  });
  grabber.add(['/', 'apples'], function(route){
    return [
      {
        subpage: 'apples'
      },
    ];
  });
  grabber.add(['/', null], function(route){
    logger.log('serverPropsGenerator for [\'/\', null]');

    return [
      {
        subpage: 'index'
      },
      {
        add: logic.add
      }
    ];
  });

  return grabber;
}