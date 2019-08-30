const entities = require('entities');

/**
 * @param {array} menu
 * @returns {array}
 */
module.exports = (menu) => (
  menu.map(day => (
    day.breakfast && day.lunch && day.dinner && {
      date: day.date,
      breakfast: day.breakfast.map(menu => entities.decodeHTML5(menu)),
      lunch: day.lunch.map(menu => entities.decodeHTML5(menu)),
      dinner: day.dinner.map(menu => entities.decodeHTML5(menu))
    }
  ))
);