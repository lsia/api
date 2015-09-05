#!/bin/env node

/**
 *  Define the application.
 */
var app = function() {

    //  Scope.
    var self = this;

    //  Requirements
    var config  = require('./config.json');
    var express = require('express');
    var http    = require('http');
    var path    = require('path');
    var fs      = require('fs');


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || config.express.port;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = config.express.ip;
        };
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating server app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };



    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */


    /**
     *  Loads the controllers with its routes handlers for the application.
     */
    self.loadControllers = function() {
        // Include the controllers (routes)
        fs.readdirSync('./' + config.paths.controllers).forEach(function (file) {
          if(file.substr(-3) == '.js') {
              var route = require('./' + config.paths.controllers + '/' + file);
              route.controller(self.app);
          }
        });
    };


    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.defaultRoutes = function() {
        self.routes = { };

        self.routes['/'] = function(req, res) {
            res.render('index', { title: 'Express' });
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.defaultRoutes();
        self.app = express();

        // Setup the environment
        self.app.set('views', __dirname + '/' + config.paths.static_files);
        self.app.set('view engine', 'ejs');
        self.app.use(express.static(path.join(__dirname, config.paths.static_files)));
        self.app.use(express.favicon(path.join(__dirname, config.paths.static_files + '/favicon.png')));
        self.app.use(express.logger('dev'));
        self.app.use(express.cookieParser()); 
        self.app.use(express.bodyParser());
        self.app.use(express.methodOverride());
        // app.use(express.session({ secret: 'securedsession' }));

        self.loadControllers();
        self.app.use(self.app.router);

        //  Add default handlers for the app (from the default routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
};



/**
 *  main():  Main code.
 */
var app_handler = new app();
app_handler.initialize();
app_handler.start();