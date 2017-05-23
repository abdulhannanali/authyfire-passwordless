/**
 * authyRequests.js
 * Library for performing Authy related requests to the Google Cloud Functions.
 * This library for sending requests is stateless. All the states should be there in the components
 */
import axios from 'axios';
import { resolve } from 'url';

const FUNCTIONS_BASE_URL = 'https://us-central1-translate-project-166509.cloudfunctions.net/';

const requestTokenURL = resolve(FUNCTIONS_BASE_URL, 'requestAuthyToken');
const verifyTokenURL = resolve(FUNCTIONS_BASE_URL, 'verifyAuthyToken');

/**
 * Requests the authy token for the given number
 * @param {String} countryCode
 * @param {String} phoneNumber
 * 
 * @return {Promise<Object>} returns an axios promise with data
 */
export function requestAuthyToken(countryCode, phoneNumber, forceSMS) {
  return axios.post(requestTokenURL, { countryCode, phoneNumber, forceSMS });
}

/** 
 * Sends the Authy Token to the Function for verification
 * 
 * @param {String} token token to be verified
 * @return {Promise<Object>} Axios promise with a response if successful
 */
export function verifyAuthyToken(phoneId, token) {
  return axios.post(verifyTokenURL, { token, phoneId });
}
