var mongoose = require('mongoose');

var Session = mongoose.model('Session', {
  date: {type: Date, default: Date.now },
  name: { type: String, required: true },
  socket: {type:String},
  startPos: {type: [Number], index: '2d'},
  pos: {type: [Number], index: '2d'}
});

exports.getBySocket = function(socket, callback) {
  Session.findOne({socket: socket}, callback);
}

exports.getNearby = function(loc, callback) {
  Session.find({pos: { $near: loc, $maxDistance: 0.001} }, callback);
}

exports.getNearbyGroup = function(session, callback) {
  console.log('getNearbyGroup ' + JSON.stringify(session));
  Session.find({pos: { $near: session.pos, $maxDistance: 0.001}, name: session.name }, callback);
}

exports.create = function(data, callback) {
  var session = new Session(data);
  session.save(function (err, result) {
    if (err) {
      console.log('session: Error saving to db: ' + err);
      callback(err);
    }
    callback(err, result);
  });
}

exports.update = function(id, data, callback) {
  Session.update({_id: id}, data, function(err, count){
    if (err) {
      console.log('session: Error update db: ' + err);
      callback(err);
    }
    callback(err, count);
  });
}

exports.delete = function(data,callback) {
  Session.findById(data._id, function(err, session){
    if (err) {
      console.log('session: Error deleting from db: ' + err);
      callback(err);
    } else if (session === null) {
      console.log('session: Error finding doc for delete');
      callback(err);
    } else {
      session.remove(callback);
    }
  });
}
