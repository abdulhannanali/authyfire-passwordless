const functions = require('firebase-functions');

const authyClient = require('authy')(functions.config().authy.apikey);

const admin = require('../admin');
const errorResponse = require('./handleError');

const cors = require('cors')({ origin: true });
const cookieParser = require('cookie-parser')();

const defaultDb = admin.database();
const authyRef = defaultDb.ref('custom-auth/authy');

const UID_PREFIX = 'phone';

/**
 * Verifies the token using Authy and authenticates if the authentication
 * process is successful  
 */
function verifyAuthyToken(req, res) {
  cookieParser(req, res, () => {
    cors(req, res, () => {
      const handleError = errorResponse.bind(this, res);

      const phoneId = req.cookies.phoneId || req.body.phoneId;
      const token = req.body.token;

      if (!phoneId) {
        return handleError({ code: 'parameter-missing', param: 'phoneId' });
      } else if (!token) {
        return handleError({ code: 'parameter-missing', param: 'token' });
      }

      if (phoneId.length > 15 || token.length > 10) {
        return handleError({ code: 'number-too-long' });
      }

      res.cookie('phoneId', undefined);
      getAuthyData(phoneId)
        .then(authyData => {
          const authyId = authyData && authyData.id;

          if (!authyId) {
            return handleError(400, { code: 'phone-not-registered', phoneId: phoneId });
          }

          return verifyToken(authyId, token, (error, result) => {
            if (error) {
              handleError(error);
            } else if (result && result.token === 'is valid' && result.success) {
              createFirebaseUser(phoneId, authyData)
                .then(function(user) {
                  updateAuthyData(true, phoneId, user);
                  return createCustomToken(user, authyData).then(
                    handleCustomToken.bind(this, res, user, authyData)
                  );
                })
                .catch(function(error) {
                  handleError(error);
                });
            }
          });
        })
        .catch(error => {
          handleError(error);
        });
    });
  });
}

/**
 * Handles the Custom Token Response and provide user with useful input 
 * it can use for it's output
 */
function handleCustomToken(res, user, authyData, customToken) {
  if (customToken) {
    res.json({
      uid: user.uid,
      lastVerificationDevice: authyData && authyData.lastDevice,
      success: true,
      customToken: customToken,
    });
  }
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
function createFirebaseUser(phoneId, authyId) {
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
function createCustomToken(uid, authyData) {
  return admin.auth().createCustomToken(uid, {
    isFirstTime: authyData.isNew,
    verificationDevice: authyData.lastDevice, 
  });
}

/**
 * Updates the Authy specific Authentication data for the given phoneId
 * Useful for tracking attempts and the future logins.
 */
function updateAuthyData(success, phoneId, user) {
  const authyChildRef = authyRef.child(phoneId);
  const TIMESTAMP = admin.database.ServerValue.TIMESTAMP;
  let authyTask;

  if (success) {
    authyTask = authyChildRef.transaction(authyData => {
      // Stores the data in case of success, resets the state of 
      // certain properties so they can work properly in the future
      authyData.totalAttempts++;
      authyData.totalSuccessAttempts++;

      authyData.lastAttempt =
      authyData.lastSuccessAttempt = TIMESTAMP;
      authyData.verified = true;
      authyData.suspended = false;
      authyData.uid = user.uid;

      return authyData;
    });
  }

  return authyTask.then(authySnapshot => {
    console.info('Authy data successfull updated for ' + phoneId);
  }).catch(error => {
    console.error('Error occured while updating authyData for ' + phoneId);
    console.error(error);
  });
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