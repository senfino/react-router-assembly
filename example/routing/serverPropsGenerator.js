'use strict';

let SerializableKeySet = require('serializable-key-set');
let grabber = new SerializableKeySet();

module.exports = function(logic){
  grabber.add(['/', 'apples/:appleType'], function(route){
    console.log("serverPropsGenerator for ['/', 'apples/:appleType']");

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