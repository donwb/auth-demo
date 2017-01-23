var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Need this to support sessions
var session = require('express-session');

// Require in passport and github strategy
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

// Called 1 time, upon successful login
passport.serializeUser(function(user, callback){
  callback(null, user);
});

// Called on each route invocation to rehydrate the
// user object from the session
passport.deserializeUser(function(obj, callback){
  callback(null, obj);
});

// This is the main func. wires up the GitHubStrategy
// using the ID, SECRET, and URL from your app in GH
// the following function is where you manage the user
// once the login succeeds
passport.use(new GitHubStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/login/github/return'
},
function(accessToken, refreshToken, profile, callback){
  process.nextTick(function(){
    // The profile object is doc'ed here:
    // http://passportjs.org/docs/profile
    // Basically use this info to map the Github user to 
    // your own user store, using profile.id as the key
    // id, displayName, and emails are interesting properties
    
    // Creating a subset of interesting GH user
    // profile info.  The approved attribute is custom
    var valid = validateUser(profile.displayName);

    var myUser = {
      displayName: profile.displayName,
      id: profile.id,
      avatar_url: profile._json.avatar_url,
      authorized: valid
    }
    console.log(myUser);
    return callback(null, myUser);
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

/* Passport initialization stuff */
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);




/* ------ Begin Passport Routes -------- */
// Fallback route in case github fails (see failureRedirect)
app.get('/login', function(req, res){
  res.render('login');
});

// This route starts the github auth flow
app.get('/login/github', 
  passport.authenticate('github', {scope: ['user:email']}),
  function(req, res){
    // noop
  });

// this is the callback from github
app.get('/login/github/return', 
  passport.authenticate('github', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
});

// does what it says
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
/* -------- End Passport Routes ---------- */

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

function validateUser(username){
    var valid = false;
    for(var i=0; i < users.length; i++){
      valid = (username === users[i]) ? true : false;
      if(valid) break;
    }
    return valid;
}

var users = [
    "Don Browning",
    "Brian Solomon"
]

module.exports = app;
