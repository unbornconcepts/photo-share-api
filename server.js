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

server.listen(config.port, function(){
  console.log('express socket.io app started. port: ' + config.port);
});
