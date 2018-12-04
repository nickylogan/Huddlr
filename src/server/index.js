import express from 'express';
import mustache from 'mustache-express';
import path from 'path';
import cookieParser from 'cookie-parser';
import webpack from 'webpack';
import uuid from 'uuid/v4';
import expressSession from 'express-session';
import socketio from 'socket.io';
import fs from 'fs';
import ip from 'ip';

import Storage from './storage';
import AppController from './controller';
import ChatSocket from './chatSocket'
import ServerSocket from './serverSocket';
import PrivateChatSocket from './privateChatSocket';

// Set up app
const app = express();

// Set up webpack middleware
const config = require('../../webpack.config.js');
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
// app.set('views', path.join(__dirname, '/resources/views')) Set up
// cookie-parser middleware
app.use(cookieParser('secret'));

// Set up session management middleware
var session = expressSession({
    genid: (req) => uuid(),
    secret: 'secret',
    resave: false,
    saveUninitialized: true
});
app.use(session);

// Set up POST data encoding middleware
app.use(express.json());
app.use(express.urlencoded());

// Set up static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set up http
var http = require('http').Server(app);
var ipaddr = ip.address('public', 'ipv4');
// var ipaddr = 'localhost';
var port = process.env.PORT || 3000;

// Set up storage
let storage = new Storage();

// Set up routes
let routes = new AppController(storage, ipaddr, port).intitialize();
app.use('/', routes.router);

// Set up sockets
let io = socketio(http);
io.use(function (socket, next) {
    session(socket.request, socket.request.res, next);
});

let serverSocket = new ServerSocket(io, storage);
let callback = serverSocket
    .broadcastServerLog
    .bind(serverSocket);
let worldSocket = new ChatSocket(io, storage, 'world', callback).initialize();
let privateSocket = new PrivateChatSocket(io, storage, 'private', callback).initialize();

http.on('close', function () {
    console.log('Stopping...');
    const directory = path.join(__dirname, '/../../upload/');
    fs.readdir(directory, (err, files) => {
        if (err) 
            throw err;
        for (const file of files) {
            // console.log(file);
            if (file != '.gitkeep') {
                fs.unlink(path.join(directory, file), (err) => {
                    if (err) throw err;
                    }
                );
            }
        }
    });
});

process.on('exit', function () {
    http.close();
});

process.on('SIGINT', function () {
    http.close();
});

http.listen(port, ipaddr, function () {
    console.log('Listening on ' + ipaddr + ':' + port);
});