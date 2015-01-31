var _ = require('lodash');
var config = require('config');
var async = require('async');
var picture = require('../models/picture');
var session = require('../models/session');

var cloudinary = require('cloudinary');
cloudinary.config(config.get('cloudinary'));

function initialize(bus, con) {
  con.on('stream:request', _.partial(sendStream,con));
  con.on('stream:all', _.partial(sendNearbyStream,con));
  con.on('event:new:image', _.partial(addImage,bus,con));
  con.on('session:stop', sessionStopped);
}

function prepareStreamResults(results) {
  results = JSON.parse(JSON.stringify(results));
  var thumbs = results.map(createThumb);
  return results;
}

function emitStream(con, err, results) {
  if (!err) {
    con.emit('event:stream', prepareStreamResults(results));
  }
}

function sendStream(con, data, callback) {
  picture.getBySession(data, function(err, results){
    if (!err) {
      if (!callback) {
        emitStream(con, err, results);
      } else {
        callback(prepareStreamResults(results));
      }
    }
  });
}

function sendNearbyStream(con) {
  console.log('sendNearbyStream id ' + con.id);
  session.getBySocket(con.id, function(err, result){
    console.log('sendNearbyStream session ' + result.name);
    session.getNearbyGroup(result, function(err,sessions){
      if (!err) {
        console.log('sendNearbyStream count ' + sessions.length);
        picture.getBySessions(_.pluck(sessions, 'id'), _.partial(emitStream,con));
      }
    });

  });
}

function createThumb(image) {
  image.thumb = cloudinary.url(image.name, {format: image.format, width: 100, height: 100, crop: 'fill', quality: 100});
  return image;
}

function addImage(bus, con, data, callback) {
  session.getBySocket(con.id, function(err, session){

    var stream = require("stream");
    var imageStream = new stream.Transform();

    var stream = cloudinary.uploader.upload_stream(function(image) {
      console.log('image uploaded');

      // send back to the client to acknowledge upload completed
      if (callback) {
        callback();
      }

      if (image.public_id) {
        var pic = {
          name: image.public_id,
          session: session.id,
          sender: data.sender,
          width: image.width,
          height: image.height,
          format: image.format,
          resource_type: image.resource_type,
          url: image.url
        };

        picture.create(pic, function(err, result) {
          if (!err) {
            var result = result.toJSON();
            createThumb(result);
            sendNearby(bus, session.pos, 'event:incoming:image', result);
          }
        });
      }
    });

    imageStream.pipe(stream);
    imageStream.push(new Buffer(data.image));
    imageStream.end();
  });
}

function sessionStopped(data) {
  picture.getBySession(data._id, function(err, pictures){
    if (!err) {
      pictures.forEach(function(pic){
        cloudinary.api.delete_resources([pic.name], function(){
          picture.delete(pic);
        });
      });
    }
  });
}

// TODO: remove this and use session-tracker for this
function sendNearby(bus, loc, msg, data) {
  session.getNearby(loc, function(err, result){
    if (result) {
      console.log('session-tracker: sending ' + msg + ' to result: ' + result.length);

      // send new session update event to all nearby clients
      async.each(result,function(session){
        console.log('session-tracker send ' + msg + ' to ' + session.socket);
        bus.to(session.socket).emit(msg, data);
      },function(err){
        // error
      });
    }
  });
}

module.exports = initialize;
