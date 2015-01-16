var _ = require('lodash');
var async = require('async');
var session = require('../models/session');

function initialize(bus, con) {
  con.on('session:start', _.partial(sessionStarted,bus,con));
  con.on('session:update', _.partial(sessionUpdate,bus,con));
  con.on('session:stop', _.partial(sessionStopped,bus));
  con.on('images:new', _.partial(sendImage,bus));
}

function sessionStarted(bus, con, data) {
  console.log('session-tracker starting session ' + session.name);

  //initialize values
  data.startPos = data.pos;
  data.socket = con.id;
  session.save(data, function (err, result) {
    if (!err) {
      var pos = (result.startPos) ? result.startPos[0] + ',' + result.startPos[1] : 'unknown';
      console.log('session-tracker started ' + result.name + ' id: ' + result._id + ' at: ' + pos);
      con.emit('event:session:started',result);
      broadcastChanges(bus, result.startPos);
    }
  });
}

function sessionUpdate(bus, con, data) {
  session.update(data._id, {name: data.name, pos: data.pos, socket: con.id}, function(err, count){
    if (!err) {
      console.log('session-tracker update ' + data.name + ' at: ' + data.pos[0] + ',' + data.pos[1], ' count ' + count);
      broadcastChanges(bus, data.pos);
    }
  });
}

function sessionStopped(bus, data) {
  session.remove(data, function(err, result){
    if (!err) {
      console.log('session-tracker: sessionStopped ' + result.name);
      broadcastChanges(bus, data.pos);
    }
  });
}

function sendNearby(bus, loc, msg, data) {
  session.getNearby(loc, function(err, result){
    if (result) {
      console.log('session-tracker: sending ' + msg + ' to result: ' + result.length);

      // send new session update event to all nearby clients
      async.each(result,function(session){
        console.log('session-tracker send ' + msg + ' to ' + session.socket + ' data ' + data);
        bus.to(session.socket).emit(msg, data);
      },function(err){
        // error
      });
    }
  });
}

function sendImage(bus,con,data) {
  session.getBySocket({socket: con.id}, function(err, result){
    if (result.length > 0) {
      var session = result[0];
      console.log('new image from ' + session.name);
      sendNearby(bus, session.pos, 'event:incoming:image', data);
    }
  });
}

function broadcastChanges(bus,loc) {
  session.getNearby(loc, function(err,result){
      // convert the response to simple objects
      var data = JSON.parse(JSON.stringify(result));
      sendNearby(bus,loc,'event:sessions',data);
  });
}

module.exports = initialize;
