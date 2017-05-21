const functions = require('firebase-functions');

const authyClient = require('authy')(functions.config().authy.apikey);

const admin = require('../admin');
const errorResponse = require('./handleError');

const defaultDb = admin.database();
const authyRef = defaultDb.ref('custom-auth/authy');

const COOKIE_SECRET = functions.config().cookies.secret || undefined;
const UID_PREFIX = 'phone';

const cookieParser = require('cookie-parser')(COOKIE_SECRET);
const cors = require('cors')({
  origin: true,
  methods: ['POST'],
});

/**
 * Verifies the token using Authy and authenticates if the authentication
 * process is successful  
 */
function verifyAuthyToken(req, res) {
  cookieParser(req, res, () => {
    cors(req, res, () => {
      const handleError = errorResponse.bind(this, res);

      const phoneId = req.body.phoneId || req.cookies.phoneId;
      const token = req.body.token;

      if (req.method !== 'POST') {
        return res.json(400, 'Method not supported');
      }

      if (!phoneId) {
        return handleError({ code: 'parameter-missing', param: 'phoneId' });
      } 

      if (!token) {
        return handleError({ code: 'parameter-missing', param: 'token' });
      }

      if (phoneId.length > 15) {
        return handleError({ code: 'number-too-long', param: 'phoneId' });
      } else if (token.length > 10) {
        return handleError({ code: 'number-too-long', param: 'token' });
      }
      
      return getAuthyData(phoneId)
        .then(authyData => {
          const authyId = authyData && authyData.id;

          if (!authyId) { 
            return handleError({ code: 'phone-not-registered', phoneId: phoneId });
          }

          return verifyToken(authyId, token, (error, result) => {
            console.info(
              `token: ${token} authyId: ${authyId} result: ${JSON.stringify(result)}`
            );
            if (error) {
              return handleError(error);
            } else if (result && result.token === 'is valid' && result.success) {
              createFirebaseUser(phoneId)
                .then(function(user) {
                  return createCustomToken(user).then(customToken => {
                    res.cookie('phoneId', undefined);
                    return handleCustomToken.bind(this, res, user)(customToken);
                  });
                })
                .catch(error => handleError(error));
            }
          });
        })
        .catch(error => handleError(error));
    });
  });
}

/**
 * Handles the Custom Token Response and provide user with useful input 
 * it can use for it's output
 */
function handleCustomToken(res, user, customToken) {
  res.json({
    uid: user.uid,
    success: true,
    customToken: customToken,
  });
}

/**
 * Gets the existing Authy Data for the given phoneId
 */
function getAuthyData(phoneId) {
  const phoneIdRef = authyRef.child(phoneId);

  return phoneIdRef.once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        return snapshot.val();
      } 
      
      return undefined;
    });
}

/**
 * Creates the user account for the particular phone Id and 
 * creates a custom token which is passed to the client 
 * for the purpose of Signing in
 */
function createFirebaseUser(phoneId) {
  const uid = toUid(phoneId);
  return admin.auth().getUser(uid)
    .then(user => {
      return user;
    })
    .catch(error => {
      // Known error, if happens a new user is created
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({ uid });
      } else {
        // Unknown error, should be handled in the parent function
        throw error;
      }
    });
}

/**
 * Creates a Custom Token with special claims for Phone Based Verification
 * This custom token is passed to the client in order to sign in with in the application
 */
function createCustomToken({ uid }) {
  return admin.auth().createCustomToken(uid, {});
}

/**
 * Verifies the Token sent using Authy
 * Authy ID is requried in order to verify the token.
 */
function verifyToken(authyId, verificationCode, callback) {
  authyClient.verify(authyId, verificationCode, callback);
}

/**
 * Converts the Phone ID which is countryCode + phoneNumber
 * to a uid which is used as an identification all across firebase
 */
function toUid(phoneId) {
  return UID_PREFIX + ':' + phoneId;
}

module.exports = verifyAuthyToken;