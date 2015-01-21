var config = require('config');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

mongoose.connect(config.get('db'));

io.on('connection', function(socket){
  require('./services')(io, socket);
});

var port = process.env.PORT || config.port; // Use the port that Heroku provides or default

server.listen(port, function(){
  console.log('express socket.io app started. port: ' + port);
});
