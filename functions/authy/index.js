/**
 * Functions for Authy
 */

const requestAuthyToken = require('./requestAuthyToken');
const verifyAuthyToken = require('./verifyAuthyToken');

module.exports = {
  requestAuthyToken: requestAuthyToken,
  verifyAuthyToken: verifyAuthyToken,
};