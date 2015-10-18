/* 
 * @Author: Tomasz Niezgoda
 * @Date: 2015-10-11 18:18:22
 * @Last Modified by: Tomasz Niezgoda
 * @Last Modified time: 2015-10-18 21:33:51
 */

'use strict';

function Logic(){}

Logic.prototype.add = function(a, b){
  return a + b;
};

module.exports = new Logic();