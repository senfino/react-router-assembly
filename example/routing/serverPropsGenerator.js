/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 23:11:42
 */

'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();
let logger = require('plain-logger')('serverPropsGenerator');

module.exports = function(logic){
  grabber.add(['/', null], function(route){
    logger.log('serverPropsGenerator for [\'/\', null]');

    return [
      null,
      {
        add: logic.add
      }
    ];
  });

  grabber.add(['/', 'apples'], function(route){
    let Q = require('q');

    logger.log('serverPropsGenerator for [\'/\', \'apples\']');

    return Q.delay(2000).then(function(){return [
      null,
      {
        initialList: ['red', 'green', 'yellow'],
        initialSelection: 'red'
      }
    ]});
  });

  return grabber;
}