var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var socket_io    = require( 'socket.io' );
var mongoose = require('mongoose');
var readyUser = require('./models/ready_users');
mongoose.connect('mongodb://127.0.0.1:27017/chessweb');

var index = require('./routes/index');

var app = express();
var io = socket_io();
app.io = io;

app.locals.projectname = "ChessWeb";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(expressSession({
    secret: 'hY797S2APCzSkjhgndFbsngMSd7dy',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var users=0;
io.on('connection', function(socket){
    readyUser.count({},function(err,count){
        io.sockets.emit('users',{count:count + ' users are online'});
    });
    socket.on('waiting',function (data) {
            console.log(data);
            users++;
            socket.broadcast.emit('newUser',{user:data.user});
            if(data.user){
                var readyuser = new readyUser({
                    "_id":data.user._id,
                    "username":data.user.name,
                    "points":data.user.points
                });
                readyuser.save(function (err, updated) {
                    if (err) console.log(err);
                });
            }
        readyUser.count({},function(err,count){
            io.sockets.emit('users',{count:count + ' users are online'});
        });
    });
    //Whenever someone disconnects this piece of code executed
    socket.on('leave',function (data) {
        readyUser.findOneAndRemove({_id : data.user._id}, function (err,updated){
            if(err) console.log(err);
        });
        readyUser.count({},function(err,count){
            io.sockets.emit('users',{count:count + ' users are online'});
        });
    });
    socket.on('disconnect', function () {
        io.sockets.emit('users',{count:users + ' users are online'});
    });
});

module.exports = app;
