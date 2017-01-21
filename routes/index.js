var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var user = req.user;
  var name;

  if (user === undefined){
    name = 'not logged in';
  } else {
    name = user.displayName;
  }
  res.render('index', { user: name });
});

router.get('/profile', function(req, res){
  // check to see if logged in, if not head to login page instead
  if (!req.isAuthenticated()) { res.redirect('/login') }
  
  res.render('profile', 
  {
    user: req.user.displayName
  });
});


module.exports = router;
