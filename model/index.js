'use strict';

var Sequelize = require('sequelize');
var sequelize = new Sequelize('reb', '', '', {
	host: 'localhost',
    dialect: 'sqlite',
	  storage: __dirname + '/reb.sqlite',
	  logging: false
});

let database = {};
let debug = require('../utils/index.js').debug;

var dbemit = (model, hook, object, options, cb) =>{
  debug('model/index.js dbemit');
  debug('  hook = ' + hook);
  debug('  object = ' + JSON.stringify(object));

  if(global.io){
    global.io.sockets.emit('dbevent', {model:model, hook: hook, object: object, options: options});
  }
}

sequelize
  .authenticate()
  .then(() => {
      let Person = sequelize.define('person', {
      shortName: { type: Sequelize.STRING },
      fullName:  { type: Sequelize.STRING },
      person_id: { type: Sequelize.INTEGER, unique: 'IDX_PERSON_PERSON_ID' },
      rscode:    { type: Sequelize.INTEGER },
      inn:       { type: Sequelize.INTEGER },
      phoneNumber: { type: Sequelize.STRING },
      url:         { type: Sequelize.STRING },
      email:       { type: Sequelize.STRING }
    });

    Person.hook('afterCreate', (object, options)=>{
      debug('person afterCreate hook');
      dbemit('person','afterCreate', object, options);
    });

    Person.sync();
    database.person = Person;
    
    let Speecher = sequelize.define('speecher', {
      shortName: { type: Sequelize.STRING },
      fullName:  { type: Sequelize.STRING },
      person_id: { type: Sequelize.INTEGER },
      user_id:   { type: Sequelize.INTEGER },
      role:      { type: Sequelize.STRING },
      phone_number:  { type: Sequelize.STRING },
      mobile_number: { type: Sequelize.STRING },
      email:         { type: Sequelize.STRING }
    });
    
    Speecher.sync();
    database.speecher = Speecher;
    
    let Speech = sequelize.define('speech', {
      speecher_id_1:  { type: Sequelize.INTEGER },
      phone_number_1: { type: Sequelize.STRING },
      speecher_id_2:  { type: Sequelize.INTEGER },
      phone_number_2: { type: Sequelize.STRING },
      caller_id:      { type: Sequelize.STRING },
      begin_dt:       { type: Sequelize.DATE },
      end_dt:         { type: Sequelize.DATE },
      speechText:     { type: Sequelize.TEXT }
    });
    
    Speech.sync();
    database.speech = Speech;
    
    let PushSubscription = sequelize.define('pushsubscription', {
      speecher_id: { type: Sequelize.INTEGER },
      user_id:     { type: Sequelize.INTEGER },
      ext:         { type: Sequelize.INTEGER },
      endpoint:    { type: Sequelize.TEXT },
      p256dh:      { type: Sequelize.STRING },
      auth:        { type: Sequelize.STRING }
    });
    
    PushSubscription.sync();
    database.pushsubscription = PushSubscription;
    
    let SocketSubscription = sequelize.define('socketsubscription', {
      speecher_id: { type: Sequelize.INTEGER },
      user_id:     { type: Sequelize.INTEGER },
      ext:         { type: Sequelize.INTEGER }
    });
    
    SocketSubscription.sync({force: true});
    database.socketsubscription = SocketSubscription;
    
    let SpeecherModel = sequelize.define('speechermodel', {
      speecher_id:     { type: Sequelize.INTEGER },
      voicekey_person: { type: Sequelize.STRING },
      model_info:      { type: Sequelize.STRING }
    });
    
    SpeecherModel.sync();
    database.speechermodel = SpeecherModel;

    let Calls = sequelize.define('calls', {
      calluuid: { type: Sequelize.STRING },
      ani:      { type: Sequelize.STRING },
      dnis:     { type: Sequelize.STRING }
    });

    Calls.sync();
    Calls.hook('afterCreate', (object, options)=>{
      debug(' calls afterCreate hook');
      dbemit('calls','afterCreate', object, options);
    });
  
    database.calls = Calls;
    
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  database.sequelize = sequelize;
  database.Sequelize = Sequelize;

module.exports = database;