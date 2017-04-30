var mongoose = require('mongoose');
var db = require('../models/db.js');

var Login = mongoose.model('Login');

module.exports.login = function(req, res) {
  var password = req.body.password;

  if (password === "1992") {
    res.status(200).send({'statusMessage' : 'success'});
  } else {
    res.status(200).send({'statusMessage' : 'error'});
  }
}
