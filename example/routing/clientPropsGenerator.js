'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();

module.exports = function(logic){
  grabber.add(['/', 'apples/:appleType'], function(route){
    console.log("clientPropsGenerator for ['/', 'apples/:appleType']");

    return [
      null,
      {
        initialSelection: 'red'
      }
    ];
  });

  return grabber;
}