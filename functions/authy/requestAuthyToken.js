const functions = require('firebase-functions');
const cookieParser = require('cookie-parser')();
const authy = require('authy');

const cors = require('cors')({
  methods: ['POST'],
  origin: true,
});

const admin = require('../admin');
const errorResponse = require('./handleError');

const GCLOUD_PROJECT = process.env.GCLOUD_PROJECT;
const AUTHY_API_KEY = functions.config().authy.apikey;

const authyClient = authy(AUTHY_API_KEY);

const defaultDb = admin.database();
const authyRef  =  defaultDb.ref('custom-auth/authy');

/**
 * Authenticates a Phone Number and sends the verification code
 * to the given phone number
 */
function requestAuthyToken(req, res) {  
  cookieParser(req, res, () => {
    cors(req, res, () => {
      const handleError = errorResponse.bind(this, res);

      if (req.method !== 'POST') {
        return res.json(400, 'Nonononono! This is an unsupported type of communication');
      }

      const body = req.body;

      if (!body.countryCode) {
        return handleError({ code: 'parameter-missing', param: 'countryCode' });
      } else if (!body.phoneNumber) {
        return handleError({ code: 'parameter-missing', param: 'phoneNumber' });
      }

      const countryCode = sanitizeNumber(body.countryCode);
      const phoneNumber = sanitizeNumber(body.phoneNumber);
      const phoneId = countryCode + phoneNumber;

      // TODO Implement forceSms Completely
      const forceSms = !!body.forceSms;

      if (phoneId.length > 15) {
        return handleError({ code: 'number-too-long' });
      }

      return getAuthyUser(countryCode, phoneNumber, phoneId, function(error, authyId) {
        if (error) {
          return handleError(error);
        }

        console.info('AuthyId accquired for the user, now sending a token');
        return sendToken(authyId, phoneId, forceSms, function(error, result) {
          if (error) {
            handleError(error);
          } else {
            res.cookie('phoneId', phoneId);
            res.json(result);
          }
        });
      });
    });
  });
}

/**
 * Sends an Authy Token using TOTP API
 * 
 * TODO: The first Code should be received through the SMS in order to make things simple.
 */
function sendToken(authyId, phoneId, forceSms, callback) {
  if (forceSms) {
    authyClient.request_sms(authyId, forceSms, tokenHandler);
  } else {
    authyClient.request_sms(authyId, tokenHandler);
  }
  
  function tokenHandler(error, result) {
    if (error) {
      callback(error);
    } else {
      result.phoneId = phoneId;
      callback(undefined, result);
    }
  }
}

/**
 * Gets an Authy User
 * If the user for the given `countryCode` and `phoneNumber`
 * is not already there, this registers a new user
 */
function getAuthyUser(countryCode, phoneNumber, phoneId, callback) {
  console.info('Getting Authy User ID for phoneId ', phoneId);
  authyRef.child(phoneId).once('value').then(snapshot => {
    if (snapshot.exists()) {
      const authyId = snapshot.val() && snapshot.val().id;
      console.info('Authy ID already exists for the Phone ID ' + phoneId + '. Reusing this value.');
      callback(undefined, authyId);
    } else {
      console.info('Registering the Authy ID for the new number with phone id ' + phoneId);
      registerAuthyUser(countryCode, phoneNumber, phoneId, function(error, result) {
        if (error) {
          callback(error);
        } else if (result) {
          const authyId = result && result.user.id;
          callback(undefined, authyId);
        }
      });
    }
  }).catch(error => callback(error));
}

/**
 * Extracts the number digits out of string.
 * This can be used to sanitize inputs typed
 * with different formats
 */
function sanitizeNumber(value) {
  return (
    typeof value === 'string' 
    && value.slice(0, 15).match(/[0123456789]/ig).join('')
  );
}

/**
 * Registers a user with the given country code and phone number
 * Default email is the namespaced user id under our application domain
 * As, this is a requirement for Authy.
 * 
 * This also adds the authy details to the firebase, to be reused for verification
 * next time we need it. Account is not created at this point, as we haven't verified the user,
 * even a single time.
 * 
 */
function registerAuthyUser(countryCode, phoneNumber, phoneId, callback) {
  const userEmail = generatePhoneEmail(phoneId);

  // User Email is generated using Country Code and Phone number for the purpose of ease of use
  return authyClient.register_user(userEmail, phoneNumber, countryCode, function(error, result) {
    if (error) {
      callback(error);
    } else if (result && result.user && result.user.id) {
      const authyId = result.user.id;
      createAuthyData(phoneId)
        .then(
          snapshot => callback(undefined, authyId)
        ).catch(
          error => callback(error)
        );
    }
  });
}

/**
 * Initializes authy data object for the given `phoneId`
 * The data object refers to the following ref path
 * - `root/custom-auth/authy/${phoneId}/authyObj`
 * 
 * where `authyObj` is data assigned in this `function`
 * and `phoneId` is the reference id of the phone 
 */
function createAuthyData(phoneId) {
  return authyRef.child(phoneId).set({
    totalAttempts: 0,
    totalFailedAttempts: 0,
    totalSuccessAttempts: 0,
    lastTokenAssigned: 0,
    triesSinceLastAttempt: 0,
    totalAssigned: 0,
    suspended: false,
    verified: false,
  });
}

/**
 * Generates an email to be used for the purpose of registering a user to Authy ID
 * This email is based on phone number and will use the firebase domain.
 * 
 * Note: Email can't be use for any other purpose but only registering the user with Authy,
 *       as they have a requirement..
 */
function generatePhoneEmail(phoneId) {
  return 'phone_' + phoneId + '@' + GCLOUD_PROJECT + '.firebaseapp.com';
}

module.exports = requestAuthyToken;