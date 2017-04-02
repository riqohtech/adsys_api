var mongoose                = require('mongoose'),
    Schema                  = mongoose.Schema,
    Company                 = require('../models/companies'),
    fs                      = require('fs'),
    mongooseUniqueValidator = require('mongoose-unique-validator');

var form = new Schema({
  topic: {type: String},
  url: {type: String},
  imagePath: {type: String},
  owner: {type: Schema.Types.ObjectId, ref: 'Company'}
},
  {
    timestamps: { createdAt: 'dateSubmitted'}
  });


form.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Form', form);