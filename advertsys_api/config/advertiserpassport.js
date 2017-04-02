var advertiserpassport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Advertiser = mongoose.model('Advertiser');

advertiserpassport.use(new LocalStrategy({
	usernameField: 'email'
},
function (username, password, done) {
  Advertiser.findOne({ email: username }, function (err, user) {
  	if (err) { 
  		return done(err);
  		}
    if (!user) {
    	return done(null, false, {
    		message: 'Incorrect username.'
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
