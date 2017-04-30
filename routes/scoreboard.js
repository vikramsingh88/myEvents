var mongoose = require('mongoose');
var db = require('../models/db.js');
var gcm = require('node-gcm');
// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender('AAAAXd306w8:APA91bHHZ2c3BLRPvo-IZGm3sjMNGkfk1_Syy0A3BzPCZs7PkaFPRMHHBRo_Db6Sr9_wf7wXJhi1sgDWg4Mivg6Mn6nnUGD5FiyU4omeH1NgjxzLw18liPB5FZaC2U-z_lpBqyteRBUx');

var Device = mongoose.model('Device');
var ScoreBoard = mongoose.model('ScoreBoard');

//Create score board
module.exports.createScoreBoard = function(req, res) {
  var teamName = req.body.teamName;
  var eventName = req.body.eventName;
  var points = req.body.points;
  var date = req.body.date;

  //adding score to respective team for event
  var newScoreBoard = new ScoreBoard();
  newScoreBoard.teamName = teamName;
  newScoreBoard.eventName = eventName;
  newScoreBoard.points = points;
  newScoreBoard.date = date;

  //saving data to mongodb
  newScoreBoard.save(function(err, savedScore) {
    if(err) {
      var message="Error in adding score";
			console.log(message);
      res.status(500).send({'statusMessage' : 'error', 'message' : message});
		} else {
			var message="a new score added to team";
      res.status(201).send({'statusMessage' : 'success', 'message' : message, "score":savedScore});
		}
  });
}

//get score board
module.exports.getScoreBoard = function (req,res) {
  ScoreBoard.find(function(err, scoreBoard) {
    if (err) {
      res.status(500).send({'statusMessage' : 'error', 'message' : 'Internal server error'});
    }
    if (scoreBoard != null && scoreBoard.length > 0) {
      res.status(200).send({'statusMessage' : 'success', 'message' : 'Score board available under scoreboard attributes','scoreboard' : scoreBoard});
    } else {
      res.status(200).send({'statusMessage' : 'error', 'message' : 'No score board available'});
    }
  });
}
