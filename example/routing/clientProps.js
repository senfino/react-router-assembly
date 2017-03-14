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