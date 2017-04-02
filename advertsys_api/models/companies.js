var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    Form = require('../models/picads'),
    mongooseUniqueValidator = require('mongoose-unique-validator');

// define the User model schema
var company = new Schema({
  email: {
    type: String,
    index: { unique: true }
  },
  password: String,
  name: String,
  forms: [{type: Schema.Types.ObjectId, ref: 'Form'}],
});


/**
 * Compare the passed password with the value in the database. A model method.
 */
 // @param {string} password
 // @returns {object} callback
 //
company.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};


/**
 * The pre-save hook method.
 */
company.pre('save', function saveHook(next) {
  var company = this;

  // proceed further only if the password is modified or the user is new
  if (!company.isModified('password')) return next();


  return bcrypt.genSalt(function (saltError, salt) {
    if (saltError) { return next(saltError); }

    return bcrypt.hash(company.password, salt, function (hashError, hash) {
      if (hashError) { return next(hashError); }

      // replace a password string with hash value
      company.password = hash;

      return next();
    });
  });
});

company.methods.generateJwt = function () {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7);

	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.name,
		exp: parseInt(expiry.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

company.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Company', company);
