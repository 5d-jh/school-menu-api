const { pathToRegexp } = require('path-to-regexp');
const { crawler } = require('./crawler');
const { DB } = require('./DBAccessor');

/**
 * 쿼리 스트링 값을 적용하는 함수
 * @param {{ hideAllergy: boolean, date: number }} options 
 * @param {object} menu 
 * @returns {array}
 */
const applyOptions = (options, menu) => {
  if (options.date) {
    menu = menu.filter(data => data.date === options.date);
  }

  if (options.hideAllergy) {
    const regex = /\d|[.]|[*]/g;

    menu = menu.map(day => (
      day.breakfast && day.lunch && day.dinner && {
        date: day.date,
        breakfast: day.breakfast.map(menu => menu.replace(regex, '')),
        lunch: day.lunch.map(menu => menu.replace(regex, '')),
        dinner: day.dinner.map(menu => menu.replace(regex, ''))
      }
    ));
  }

  return menu;
};

exports.menuService = async (schoolType, schoolCode, query) => {
  const menuYear = Number(query.year) || new Date().getFullYear();
  const menuMonth = Number(query.month) || new Date().getMonth()+1;

  const db = new DB(schoolCode, menuYear, menuMonth);
  let menu = await db.get();
  const isFetchedFromDB = Boolean(menu);

  if (!isFetchedFromDB) {
    const neisData = await crawler(schoolType, schoolCode, menuYear, menuMonth);
    
    menu = neisData.menu;

    if (neisData.shouldSave) {
      db.put(neisData.menu)
      .then(() => db.close())
      .catch(err => console.error(err));
    }
  }
  
  return {
    menu: applyOptions({
      hideAllergy: query.hideAllergy === "true" ? true : false,
      date: query.date
    }, menu),
    isFetchedFromDB
  };
}