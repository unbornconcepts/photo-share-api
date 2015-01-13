var config = require('config');
var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);


io.on('connection', function(socket){
  console.log('new connection');
  require('./services')(io, socket);
});

server.listen(config.port, function(){
  console.log('express socket.io app started. port: ' + config.port);
});
