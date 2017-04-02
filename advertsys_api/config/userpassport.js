var userpassport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

userpassport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	session: false,
	passReqToCallback: true	
},
function (username, password, done) {
  User.findOne({ email: username }, function (err, user) {
  	if (err) { 
  		return done(err);
  		}
    if (!user) {
    	return done(null, false, {
    		message: 'User not found.'
    	});
    }
    if (!user.validPassword(password)) {
    	return done(null, false, {
    		message: 'Incorrect password.'
    	});
    }
    return done(null, user);
  });
}));


