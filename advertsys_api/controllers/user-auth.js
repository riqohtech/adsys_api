var validator = require('validator');
var passport = require('passport');


/**
 * Validate the sign up form
 */
 // @param {object} payload - the HTTP body message
 // @returns {object} The result of validation. Object contains a boolean validation result,
 /**                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    isFormValid = false;
    errors.password = 'Password must have at least 8 characters.';
  }

  if (!payload || typeof payload.firstname !== 'string' || payload.firstname.trim().length === 0) {
    isFormValid = false;
    errors.firstname = 'Please provide your first name.';
  }

  if (!payload || typeof payload.secondname !== 'string' || payload.secondname.trim().length === 0) {
    isFormValid = false;
    errors.secondname = 'Please provide your second name.';
  }

  if (!payload || typeof payload.mobile !== 'string' || payload.mobile.trim().length < 10) {
    isFormValid = false;
    errors.mobile = 'mobile must have at least 10 characters.';
  }

  if (!payload || typeof payload.idnumber !== 'string' || payload.idnumber.trim().length < 8) {
    isFormValid = false;
    errors.idnumber = 'idnumber must have at least 8 characters.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

/**
 * Validate the login form
 */
 // @param {object} payload - the HTTP body message
 // @returns {object} The result of validation. Object contains a boolean validation result,
 /**                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
  var errors = {};
  var isFormValid = true;
  var message = '';

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

module.exports.signup = function (req, res) {
  const validationResult = validateSignupForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }


  passport.authenticate('user-signup', function (err) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // the 11000 Mongo code is for a duplication email error
        // the 409 HTTP status code is for conflict error
        return res.status(409).json({
          success: false,
          message: 'Check the form for errors.',
          errors: {
            email: 'This email is already taken.'
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'You have successfully signed up! Now you should be able to log in.'
    });
  })(req, res);
};


module.exports.login = function (req, res) {
  const validationResult = validateLoginForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }


  passport.authenticate('user-login', function (err, token, companyData) {
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      });
    }


    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token: token,
      company: companyData
    });
  })(req, res);
};

