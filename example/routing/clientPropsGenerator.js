var SerializableKeySet = require('serializable-key-set');
var grabber = new SerializableKeySet();

module.exports = function(logic){
  grabber.add(['/', '/apples'], function(variance){
    return {
      
    };
  });

  return grabber;
}