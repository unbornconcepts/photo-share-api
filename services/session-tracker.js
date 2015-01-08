

function initialize(emitter) {
    emitter.on('session:start', sessionStarted);
}

function sessionStarted(session) {
  console.log('session-tracker: ' + session.name);
}

module.exports = initialize;
