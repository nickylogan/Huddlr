const
    express = require('express'),
    mustache = require('mustache-express'),
    sassMiddleware = require('node-sass-middleware'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    webpack = require('webpack');

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