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
    menu = menu.filter(data => data.date == options.date);
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

/**
 * School menu API 서비스 모듈
 * @param {string} path - URL 경로
 * @param {object} query - 쿼리 스트링
 */
exports.menuService = async (path, query) => {
  const pathVal = pathToRegexp('/:schoolType/:schoolCode').exec(path);

  if (!pathVal) {
    return {
      menu: [],
      isFetchedFromDB: false
    }
  }

  const [_, schoolType, schoolCode] = pathVal

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
      .then(() => db.close());
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