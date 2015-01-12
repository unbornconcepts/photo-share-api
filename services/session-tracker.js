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

function initialize(bus, con) {
  con.on('session:start', _.partial(sessionStarted,bus));
  con.on('session:stop', _.partial(sessionStopped,bus));
}

function sessionStarted(bus, data) {
  var session = new Session(data);

  session.startPos = session.pos;
  session.save(function (err) {
    if (err) {
      console.log('session-tracker: Error saving to db: ' + err);
    } else {
      // bus.emit('session:started', session);
      console.log('session-tracker started ' + session.name + ' at: ' + session.startPos[0] + ',' + session.startPos[1]);
      broadcastChanges(bus, session.startPos);
    }
  });
}

function sessionStopped(bus, data) {
  Session.findById(data._id, function(err, session){
    if (err) {
      console.log('session-tracker: Error deleting from db: ' + err);
    } else if (session === null) {
      console.log('session-tracker: Error finding doc for delete');
    } else {
      session.remove();
      // bus.emit('session:stopped', session);
      console.log('session-tracker: sessionStopped ' + session.name);
    }
  });
}

function broadcastChanges(bus, loc) {
  Session.find({pos: { $near: loc, $maxDistance: 0.01} }, function(err, sessions){
    console.log('session-tracker: sending sessions: ' + sessions.length);

    // convert the response to simple objects
    var resp = JSON.parse(JSON.stringify(sessions));
    bus.emit('event:sessions', resp);
  });
}

module.exports = initialize;
