var _ = require('lodash');
var config = require('config');
var winston = require('winston');
var logger = new (winston.Logger)(config.logger);

//TODO - use the logger instance and allow it to be configured with config
function initialize(bus) {
    bus.on('log:info', _.partial(winston.log,'info'));
    bus.on('log:warning', _.partial(winston.log,'warning'));
    bus.on('log:debug', _.partial(winston.log,'debug'));
    bus.on('log:error', _.partial(winston.log,'error'));
}

module.exports = initialize;
