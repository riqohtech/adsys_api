var Company = require('mongoose').model('Company');
var PassportLocalStrategy = require('passport-local').Strategy;


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
    password: password.trim(),
    name: req.body.name.trim()
  };

  var newCompany = new Company(companyData);
  newCompany.save((err) => {
    if (err) { return done(err); }

    return done(null);
  });
});
