var SerializableKeySet = require('serializable-key-set');
var grabber = new SerializableKeySet();

module.exports = function(logic){
  grabber.add(['/', 'apples/:appleType'], function(variance){
    console.log("serverPropsGenerator for ['/', 'apples/:appleType']");
    return {
      initialList: ['red apples', 'green apples', 'yellow apples']
    };
  });

  return grabber;
}