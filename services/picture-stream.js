var _ = require('lodash');
var config = require('config');
var async = require('async');
var picture = require('../models/picture');
var session = require('../models/session');

var cloudinary = require('cloudinary');
cloudinary.config(config.get('cloudinary'));

function initialize(bus, con) {
  con.on('event:new:image', _.partial(addImage,bus,con));
}

function addImage(bus, con, data) {
  session.getBySocket(con.id, function(err, session){

    var stream = require("stream");
    var imageStream = new stream.Transform();

    var stream = cloudinary.uploader.upload_stream(function(image) {
      console.log('image uploaded');
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
        sendNearby(bus, session.pos, 'event:incoming:image', result.toJSON());
      });
    });

    imageStream.pipe(stream);
    imageStream.push(new Buffer(data.image));
    imageStream.end();
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
