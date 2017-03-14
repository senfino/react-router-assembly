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