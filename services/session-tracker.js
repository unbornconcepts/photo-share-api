var _ = require('lodash');
var config = require('config');
var mongoose = require('mongoose');
var async = require('async');

mongoose.connect(config.get('db'));

var Session = mongoose.model('Session', {
  date: {type: Date, default: Date.now },
  name: { type: String, required: true },
  socket: {type:String},
  startPos: {type: [Number], index: '2d'},
  pos: {type: [Number], index: '2d'}
});

function initialize(bus, con) {
  con.on('session:start', _.partial(sessionStarted,bus,con));
  con.on('session:update', _.partial(sessionUpdate,bus,con));
  con.on('session:stop', _.partial(sessionStopped,bus));
  con.on('event:new:image', _.partial(sendImage,bus,con));
}

function sessionStarted(bus, con, data) {
  var session = new Session(data);

  session.startPos = session.pos;
  session.socket = con.id;
  session.save(function (err) {
    if (err) {
      console.log('session-tracker: Error saving to db: ' + err);
    } else {
      // bus.emit('session:started', session);
      var pos = (session.startPos) ? session.startPos[0] + ',' + session.startPos[1] : 'unknown';
      console.log('session-tracker started ' + session.name + ' at: ' + pos);
      broadcastChanges(bus, session.startPos);
    }
  });
}

function sessionUpdate(bus, con, data) {
  Session.update({_id: data._id}, {name: data.name, pos: data.pos, socket: con.id}, function(err, count){
    if (err) {
      console.log('session-tracker: Error update db: ' + err);
    } else {
      // bus.emit('session:started', session);
      console.log('session-tracker update ' + data.name + ' at: ' + data.pos[0] + ',' + data.pos[1]);
      broadcastChanges(bus, data.pos);
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
      broadcastChanges(bus, data.pos);
    }
  });
}

function getNearby(loc, callback) {
  Session.find({pos: { $near: loc, $maxDistance: 0.05} }, callback);
}

function sendNearby(bus, loc, msg, data) {
  getNearby(loc, function(err, sessions){
    if (sessions) {
      console.log('session-tracker: sending ' + msg + ' to sessions: ' + sessions.length);

      // send new sessions update event to all nearby clients
      async.each(sessions,function(session){
        bus.to(session.socket).emit(msg, data);
      },function(err){
        // error
      });
    }
  });
}

function sendImage(bus,con,data) {
  Session.find({socket: con.id}, function(err, sessions){
    if (sessions.length > 0) {
      var session = sessions[0];
      console.log('new image from ' + session.name);
      sendNearby(bus, session.pos, 'event:incoming:image', data);
    }
  });
}

function broadcastChanges(bus,loc) {
  getNearby(loc, function(err,sessions){
      // convert the response to simple objects
      var data = JSON.parse(JSON.stringify(sessions));
      sendNearby(bus,loc,'event:sessions',data);
  });
}

module.exports = initialize;
