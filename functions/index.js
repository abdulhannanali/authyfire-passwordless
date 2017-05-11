var functions = require('firebase-functions');

var authyFunctions = require('./authy');

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Passwordless Authentication with Firebase using Twilio!');
});


// Functions regarding Authy's Passwordless Authentication
exports.requestAuthyToken = functions.https.onRequest(authyFunctions.requestAuthyToken);
exports.verifyAuthyToken = functions.https.onRequest(authyFunctions.verifyAuthyToken);