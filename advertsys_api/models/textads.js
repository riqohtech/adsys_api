var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Company = require('../models/companies'),
    mongooseUniqueValidator = require('mongoose-unique-validator');

var textad = new Schema({
  title: {type: String},
  message: {type: String},
  //owner: {type: Schema.Types.ObjectId, ref: 'Company'}
},
{
  timestamps: { createdAt: 'dateSubmitted'}
});

textad.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Textad', textad);