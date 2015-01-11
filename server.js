var config = require('config');
var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);


io.on('connection', function(socket){
  require('./services')(socket);

  socket.on('event:new:image',function(data){
    console.log('new image from ' + data.name);
    socket.broadcast.emit('event:incoming:image',data);
  });
});

server.listen(config.port, function(){
  console.log('express socket.io app started. port: ' + config.port);
});
