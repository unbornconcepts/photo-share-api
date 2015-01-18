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

module.exports.create = function(data, callback) {
  var picture = new Picture(data);
  picture.save(function (err, result) {
    if (err) {
      console.log('stream: Error saving to db: ' + err);
      callback(err);
    }
    callback(err, result);
  });
}
