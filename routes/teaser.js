var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mongoose = require('mongoose');
var db = require('../models/db.js');
var gcm = require('node-gcm');
// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender('AAAAXd306w8:APA91bHHZ2c3BLRPvo-IZGm3sjMNGkfk1_Syy0A3BzPCZs7PkaFPRMHHBRo_Db6Sr9_wf7wXJhi1sgDWg4Mivg6Mn6nnUGD5FiyU4omeH1NgjxzLw18liPB5FZaC2U-z_lpBqyteRBUx');

var Device = mongoose.model('Device');

var ComingSoon = mongoose.model('ComingSoon');

module.exports.getTeaser = function(req, res) {
  var url = path.join(__dirname, '/uploads');
  console.log(url);
  var img = fs.readFileSync(url+'/banner.png');
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');
}


module.exports.teaser = function(req, res) {
  // create an incoming form object
  var form = new formidable.IncomingForm();
  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;
  // store all uploads in the /uploads directory
  console.log("file ", __dirname);
  form.uploadDir = path.join(__dirname, '/uploads');
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  var filePath = path.join(form.uploadDir, "banner.png");
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, "banner.png"));
  });
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    var bannerPath = filePath;
    var message="A new event banner created";
    Device.find({}, 'registrationId -_id', function(err, deviceIds) {
      if (err) {
        res.status(500).send({'statusMessage' : 'error', 'message' : "Error in sending notification"});
      }
      if (deviceIds != null && deviceIds.length > 0) {
        fcm(deviceIds, bannerPath);
        res.status(200).send({'statusMessage' : 'success', 'message' : message,'path' : bannerPath});
      } else {
        res.status(500).send({'statusMessage' : 'error'});
      }
    });
  });
  // parse the incoming request containing the form data
  form.parse(req);
}

//FCM method
var fcm = function(deviceIds, path) {
  // Prepare a message to be sent
  var message = new gcm.Message({
      data: { path : path}
  });
  // Specify which registration IDs to deliver the message to
  var regTokens = [];
  for (var i = 0; i < deviceIds.length; i++) {
    var device = deviceIds[i];
    regTokens.push(device.registrationId);
  }
  console.log("deviceIds",regTokens);

  // Actually send the message
  sender.send(message, { registrationTokens: regTokens }, function (err, response) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Response",response);
      }
  });
}
