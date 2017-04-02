var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    mongooseUniqueValidator = require('mongoose-unique-validator');

// define the User model schema
var user = new Schema({
  email: {
    type: String,
    index: { unique: true }
  },
  firstname: {
	type: String,
	required: true
  },
  secondname: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  idnumber: {
    type: String,
    required: true
  },
  password: String
});


/**
 * Compare the passed password with the value in the database. A model method.
 */
 // @param {string} password
 // @returns {object} callback
 //
user.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};


/**
 * The pre-save hook method.
 */
user.pre('save', function saveHook(next) {
  var user = this;

  // proceed further only if the password is modified or the user is new
  if (!user.isModified('password')) return next();


  return bcrypt.genSalt(function (saltError, salt) {
    if (saltError) { return next(saltError); }

    return bcrypt.hash(user.password, salt, function (hashError, hash) {
      if (hashError) { return next(hashError); }

      // replace a password string with hash value
      user.password = hash;

      return next();
    });
  });
});

user.methods.generateJwt = function () {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7);

	return jwt.sign({
		_id: this._id,
		email: this.email,
		firstname: this.firstname,
		exp: parseInt(expiry.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

user.plugin(mongooseUniqueValidator);

mongoose.model('User', user);