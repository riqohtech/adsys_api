var jwt = require('jsonwebtoken');
var Company = require('mongoose').model('Company');
var PassportLocalStrategy = require('passport-local').Strategy;
//var config = require('../../config');


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, function (req, email, password, done) {
  var companyData = {
    email: email.trim(),
    password: password.trim()
  };

  // find a user by email address
  return Company.findOne({ email: companyData.email }, function (err, company) {
    if (err) { return done(err); }

    if (!company) {
      var error = new Error('Incorrect email or password');
      error.name = 'IncorrectCredentialsError';

      return done(error);
    }

    // check if a hashed user's password is equal to a value saved in the database
    return company.comparePassword(companyData.password, function (passwordErr, isMatch) {
      var token;
      if (err) { return done(err); }

      if (!isMatch) {
        var error = new Error('Incorrect email or password');
        error.name = 'IncorrectCredentialsError';

        return done(error);
      }

      token = company.generateJwt();

      return done(null, token);
    });
  });
});
