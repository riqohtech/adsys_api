var mongoose = require('mongoose');

var vegesSchema = new mongoose.Schema({
	vegType: {
		type: String
	},
	tempRequirements: {
		type: Number
	},
	waterRequirements: {
		type: Number
	},
	maturityPeriod: {
		type: Number
	},
	isGrowing: {
		type: Boolean
	},
	growComment: {
		type: String
	}
});

var growingSchema = new mongoose.Schema({
	currentlyGrowing: {
		type: String
	},
	startGrowing: {
		type: Date
	},
	okigreenMem: {
		type: String
	},
	veges: [vegesSchema]
});

mongoose.model('Plant', growingSchema);