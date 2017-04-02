var User = require('mongoose').model('User');
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
  var userData = {
    email: email.trim(),
    password: password.trim(),
    firstname: req.body.firstname.trim(),
    secondname: req.body.secondname.trim(),
    mobile: req.body.mobile.trim(),
    idnumber: req.body.idnumber.trim()
  };

  var newUser = new User(userData);
  newUser.save((err) => {
    if (err) { return done(err); }

    return done(null);
  });
});
