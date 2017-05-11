const admin = require('firebase-admin');
const sa = require('./sa.json');

const DATABASE_URL = 'https://' + process.env.GCLOUD_PROJECT + '.firebaseio.com';

admin.initializeApp({
  credential: admin.credential.cert(sa),
  databaseURL: DATABASE_URL,
});

module.exports = admin;