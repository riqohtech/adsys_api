var advertiserpassport = require('passport');
var mongoose = require('mongoose');
var Advertiser = mongoose.model('Advertiser');

var sendJSONresponse = function (res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.register = function (req, res) {
	if (!req.body.companyname || !req.body.email || !req.body.password) {
		sendJSONresponse(res, 400, {
			"message": "All fields required"
		});
		return;
	}

	var advertiser = new Advertiser();

	advertiser.companyname = req.body.companyname;
	advertiser.email = req.body.email;

	advertiser.setPassword(req.body.password);

	advertiser.save(function (err) {
		var token;
		if (err) {
			sendJSONresponse(res, 404, err);
		} else {
			token = advertiser.generateJwt();
			sendJSONresponse(res, 200, {
				"token": token
			});
		}
	});
};

module.exports.login = function (req, res) {
	if (!req.body.email || !req.body.password) {
		sendJSONresponse(res, 400, {
			"message": "All fields required"
		});
		return;
	}
	advertiserpassport.authenticate('local', function (err, user, info) {
		var token;
		if (err) {
			sendJSONresponse(res, 404, err);
			return;
		}
		if (user) {
			token = user.generateJwt();
			sendJSONresponse(res, 200, {
				"token": token
			});
		} else {
			sendJSONresponse(res, 401, info);
		}
	}) (req, res);
};