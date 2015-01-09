var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var EventEmitter = require('events').EventEmitter;


// create an instance of event emitter for pub/sub
var bus = new EventEmitter();

// dynamically load all modules in the services directory
require('./services')(bus);

var app = express();

app.set('port', config.port);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function(req, res, next){
    var objId = (req.params && req.params.id) ? req.params.id : '';
    bus.emit('log:info', 'server', req.method + ' ' + req.url + ' ' + objId + ' ' + JSON.stringify(req.body));
    next();
});

app.use(cors());

// dynamically load all controllers in the controller directory
require('./controllers')(app,bus);

app.listen(config.port);

bus.emit('log:info', 'server', 'express app started. port: ' + config.port);
