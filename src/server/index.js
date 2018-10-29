import express from 'express';
import mustache from 'mustache-express';
import path from 'path';
import cookieParser from 'cookie-parser';
import webpack from 'webpack';
import uuid from 'uuid/v4';
import session from 'express-session';

import Session from './session';
import AppController from './controller';

// Set up app
const app = express();

// Set up webpack middleware
const config  = require('../../webpack.config.js');
const compiler = webpack(config);
app.use(require('webpack-dev-middleware')(compiler));
app.use(require('webpack-hot-middleware')(compiler));

// Disable template caching on development
if (app.get('env') === 'development') {
    app.set('view cache', false);
}

// Set up templating engine
app.engine('html', mustache());
app.set('view engine', 'html');
// app.set('views', path.join(__dirname, '/resources/views'))

// Set up cookie-parser middleware
app.use(cookieParser('secret'));

// Set up session management middleware
app.use(session({
    genid: (req) => uuid(),
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Set up POST data encoding middleware
app.use(express.json());
app.use(express.urlencoded());

// Set up static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set up session data
let sessionData = new Session();

// Set up routes
let routes = new AppController(sessionData).intitialize();
app.use('/', routes.router);

// Set up sockets
require('./sockets');

// Set up http
var http = require('http').Server(app);
var port = process.env.PORT || 3000;

http.listen(port, function () {
    console.log('Listening on localhost:' + port);
});
