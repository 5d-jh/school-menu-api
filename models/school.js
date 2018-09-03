const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolInfo = new Schema({
  type: String,
  region: String,
  code: String,
  name: String
});

module.exports = mongoose.model('school_infos', schoolInfo);