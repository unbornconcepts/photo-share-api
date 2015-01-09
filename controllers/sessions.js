var _ = require('lodash');

module.exports = function(app, bus){

	app.post('/sessions', function(req, res){
    bus.once('session:started', function(session){
      // check to the see if the pos of the emitted session matches the pos of the
      // on passed in the request.  If so return the newly created session which will
      // include and _id that will be used for further calls
      if (_.difference(session.pos, req.body.pos).length === 0) {
        res.status(200).send(session);
      }
    });
    bus.emit('session:start', req.body);
  });

  app.delete('/sessions/:id', function(req, res){
    bus.emit('session:stop', {_id: req.params.id});
    res.status(204).send();
  });

  app.get('/sessions', function(req, res){
    bus.once('session:results', function(results){
      res.status(200).send(results);
    });
    bus.emit('session:query', {loc: req.params.loc});
  });
};
