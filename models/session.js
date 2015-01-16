var mongoose = require('mongoose');

var Session = mongoose.model('Session', {
  date: {type: Date, default: Date.now },
  name: { type: String, required: true },
  socket: {type:String},
  startPos: {type: [Number], index: '2d'},
  pos: {type: [Number], index: '2d'}
});

module.exports.getBySocket = function(socket, callback) {
  Session.find({socket: socket}, callback);
}

module.exports.getNearby = function(loc, callback) {
  Session.find({pos: { $near: loc, $maxDistance: 0.05} }, callback);
}

module.exports.save = function(data, callback) {
  var session = new Session(data);
  session.save(function (err, result) {
    if (err) {
      console.log('session: Error saving to db: ' + err);
    }
    callback(err, result);
  });
}

module.exports.update = function(id, data, callback) {
  Session.update({_id: id}, data, function(err, count){
    if (err) {
      console.log('session: Error update db: ' + err);
    }
    callback(err, count);
  });
}

module.exports.remove = function(data,callback) {
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
