var _ = require('lodash');
var config = require('config');
var mongoose = require('mongoose');

mongoose.connect(config.get('db'));

var Session = mongoose.model('Session', {
  date: {type: Date, default: Date.now },
  name: { type: String, required: true },
  startPos: {type: [Number], index: '2d'},
  pos: {type: [Number], index: '2d'}
});

function initialize(bus) {
  bus.on('session:start', _.partial(sessionStarted,bus));
  bus.on('session:stop', _.partial(sessionStopped,bus));
}

function sessionStarted(bus, session) {
  var session = new Session(session);

  session.startPos = session.pos;
  session.save(function (err) {
    if (err) {
      bus.emit('log:error','session-tracker','Error saving to db: ' + err);
    } else {
      bus.emit('session:started', session);
      bus.emit('log:debug','session-tracker','sessionStarted ' + session.name);
    }
  });
}

function sessionStopped(bus, session) {
  var session = Session.findOne(session, function(err, session){
    if (err) {
      bus.emit('log:error','session-tracker','Error deleting from db: ' + err);
    } else if (session === null) {
      bus.emit('log:error','session-tracker','Error finding doc for delete');
    } else {
      session.remove();
      bus.emit('session:stopped', session);
      bus.emit('log:debug','session-tracker','sessionStopped ' + session.name);
    }
  });
}

module.exports = initialize;
