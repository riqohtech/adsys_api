var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Company = require('../models/companies'),
    mongooseUniqueValidator = require('mongoose-unique-validator');

var link = new Schema({
  link: {type: String},
  //owner: {type: Schema.Types.ObjectId, ref: 'Company'}
},
{
  timestamps: { createdAt: 'dateSubmitted'}
});

link.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Link', link);