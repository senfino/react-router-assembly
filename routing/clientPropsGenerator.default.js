/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-13 21:52:00
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-13 21:53:08
 */
'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();

module.exports = function(logic){
  return grabber;
}