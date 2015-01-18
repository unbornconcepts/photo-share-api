var mongoose = require('mongoose');

var Picture = mongoose.model('Picture', {
  date: {type: Date, default: Date.now },
  session: String,
  sender: String,
  name: { type: String, required: true },
  width: Number,
  height: Number,
  format: String,
  resource_type: String,
  url: String
});

exports.create = function(data, callback) {
  var picture = new Picture(data);
  picture.save(function (err, result) {
    if (err) {
      console.log('stream: Error saving to db: ' + err);
      callback(err);
    }
    callback(err, result);
  });
}

exports.getBySession = function(session, callback) {
  Picture.find({session: session}, callback);
}

exports.delete = function(data, callback) {
  Picture.findOneAndRemove({_id: data._id}, function(err, count){
    if (err) {
      console.log('picture: Error deleting from db: ' + err);
    } else if (count === 0) {
      console.log('picture: Error finding doc for delete');
    }

    if (callback) {
      callback(err, count);
    }
  });
}
