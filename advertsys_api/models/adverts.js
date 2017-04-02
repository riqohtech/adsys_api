var mongoose = require('mongoose');

var advertsSchema = new mongoose.Schema({
	adname: {
		type: String,
		required: true
	},
  adtime: {
    type: Number,
    required: true
  },
	adkeywords: {
		type: [String],
		required: true
	},
	starttime: {
    type: Date
  }
 //  ,
	// endtime: {
 //    type: String
 //  }
});

mongoose.model('Adverts', advertsSchema);