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

module.exports = router;
