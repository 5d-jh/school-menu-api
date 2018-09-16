const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  schoolCode: String,
  schoolRegion: String,
  schoolType: Number,
  menuTable: Array,
  menuYear: Number,
  menuMonth: Number
});

module.exports = mongoose.model('schoolMenu', menuSchema);