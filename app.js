var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var passport = require('passport');
//var GitHubStrategy = require('passport-github').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;

passport.serializeUser(function(user, callback){
  callback(null, user);
});

passport.deserializeUser(function(obj, callback){
  callback(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/login/github/return'
},
function(accessToken, refreshToken, profile, callback){
  process.nextTick(function(){
    console.log(profile.id);
    console.log(profile.displayName);
    console.log(profile.emails);

    
    return callback(null, profile);
  });
}));


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Passport stuff
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/login/github', 
  passport.authenticate('github', {scope: ['user:email']}),
  function(req, res){
    // noop
  });

app.get('/login/github/return', 
  passport.authenticate('github', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/profile', ensureAuthenticated, function(req, res){
    console.log(req);
    res.render('profile', { user: req.user.displayName });
});


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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports = app;
