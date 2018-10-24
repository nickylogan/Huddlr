var express = require('express'),
    mustache = require('mustache-express'),
    sassMiddleware = require('node-sass-middleware'),
    path = require('path'),
    cookieParser = require('cookie-parser');

// Set up app
app = express();

// Disable template caching on development
if (app.get('env') === 'development') {
    app.set('view cache', false);
}

// Set up templating engine
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/resources/views'))

// Set up sass middleware
app.use(sassMiddleware({
    src: path.join(__dirname, '/resources/sass'),
    dest: path.join(__dirname, '/public/css'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/public/css',
}))

// Set up cookie-parser middleware
app.use(cookieParser());

// Set up POST data encoding middleware
app.use(express.json());
app.use(express.urlencoded());

// Set up static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/', require('./routes'));

// Set up http
var http = require('http').Server(app);
var port = process.env.PORT || 3000;

http.listen(port, function () {
    console.log('If you are seeing this, everything is working fine!');
    console.log('Listening on *:' + port);
});