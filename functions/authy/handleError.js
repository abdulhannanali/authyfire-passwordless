/**
 * Simple Error Handler to gracefully deal with Error 
 * responses in our applications
 */

function handleError(res, error) {
  var sendError = sendErrorResponse.bind(this, res);

  // Patterns matching to Authy Specific Errors
  if (error.error_code) {
    return handleAuthyError(res, error);
  }

  if (error.code === 'parameter-missing') {
    return sendError(400, {message: `Parameter ${error.param} is missing`, code: error.code, param: error.param });
  } else if (error.code === 'number-too-long') {
    return sendError(
      400, 
      {message: 'We currently don\'t deal with such long alien numbers.', code: error.code}
    );
  } else if (error.code === 'phone-not-registered') {
    return sendError(
      400,
      { code: error.code, message: 'Phone number number is not registered with us', phoneId: error.phoneId }
    );
  }

  console.error(error);
  return sendError(503, { message: 'Unexpected error occured please try again later', code: 'unexpected-error'});
}

function handleAuthyError(res, error) {
  const error_code = error && error.error_code;

  if (
     error_code === '60027'
     || error_code === '60016'
     || error_code === '60017'
     || error.cellphone === 'is invalid'
     || error.country_code === 'is not supported'
     || error.email === 'is invalid'
     || error.token === 'is invalid'
  ) {
    return res.json(400, error);
  } else {
    console.error('Some serious error with Authy Service', error);
    return sendErrorResponse(res, 503, { message: 'Unexpected Error Occured', code: 'unexpected-error'});
  }
}

function sendErrorResponse(res, status, errorObject) {
  errorObject.success = false;
  res.json(errorObject);
}

module.exports = handleError;