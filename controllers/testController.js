'use strict';

module.exports.controller = function(app) {

	/*var passport = require('passport');*/
	var config = require('../config.json');
	var model = require(config.paths.models + 'testModel.js');

	/*// Add passport initialization
	app.use(passport.initialize()); 
	app.use(passport.session());*/


	//
	// Routes
	//

	// GET: /test/get
	app.get('/test/get/:id', function(req, res) {

		/*if(!req.isAuthenticated()) {
			res.send('Access forbidden.');
			return;
		}*/

		model.get(req.params.id, function(r) {
			res.send(r);
		});
	});


	// POST: /test/insert
	app.post('/test/insert', function(req, res) {

		/*if(!req.isAuthenticated()) {
			res.send('Access forbidden.');
			return;
		}*/

		// We extract the data from the request object
		var data = req.body;

		model.insert(data, function(r) {
			res.send(r);
			/*res.send(200);*/
		});
	});
}


