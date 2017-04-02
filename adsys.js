require('dotenv').load();
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var passport = require('passport');

var http = require('http').Server(app);
var io = require('socket.io')(http);

//var board, socket, connected = false;

require('./advertsys_api/models/db');
//require('./advertsys_api/config/userpassport');
//require('./advertsys_api/config/advertiserpassport');
var userSignupStrategy = require('./advertsys_api/passport/user-signup');
var userLoginStrategy = require('./advertsys_api/passport/user-login');
var companySignupStrategy = require('./advertsys_api/passport/company-signup');
var companyLoginStrategy = require('./advertsys_api/passport/company-login');

//var routes = require('./app_server/routes/index');
var routesApi = require('./advertsys_api/routes/index');
// var users = require('./app_server/routes/users');

// view engine setup
//app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'advertsys_ui')));

app.use(passport.initialize());

passport.use('user-signup', userSignupStrategy);
passport.use('user-login', userLoginStrategy);
passport.use('company-signup', companySignupStrategy);
passport.use('company-login', companyLoginStrategy);

// CORS setup
// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    next();
});

//app.use('/', routes);
app.use('/api', routesApi);
// app.use('/users', users);
app.use(function (req, res) {
  res.sendFile(path.join(__dirname, 'advertsys_ui', 'index.html'));
});

// Socket-io
// io.on('connection', function(s){
//   console.log('a user has connected');
//   // tracking connection
//   connected = true;
//   // saving this for the board on ready callback function
//   socket = s;
//   //socket.emit('Server message', "Hello from the Server!");
// });
// io.on('connection', function (socket) {
//   console.log('User connected..');
//   socket.on('disconnect', function () {
//     console.log('User disconnected..');
//   });
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// Catch unauthorized errors
app.use(function (err, req, res, next) {
  if (err.name === 'unauthorizedError') {
    res.status(401);
    res.json({ "message": err.name + ":" + err.message });
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.listen(port, function () {
  console.log("listening on port: *" + port);
});

module.exports = app;