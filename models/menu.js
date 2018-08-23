const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  school_id: String,
  menu: Array,
  year: String,
  month: String
});

module.exports = mongoose.model('school_menus', menuSchema, 'school_menus');