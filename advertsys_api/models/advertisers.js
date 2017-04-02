var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var advertiserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true
	},
	companyname: {
		type: String,
		required: true
	},
	hash: String,
	salt: String
});

advertiserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

advertiserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
};

advertiserSchema.methods.generateJwt = function () {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7);

	return jwt.sign({
		_id: this._id,
		email: this.email,
		name: this.companyname,
		exp: parseInt(expiry.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

mongoose.model('Advertiser', advertiserSchema);