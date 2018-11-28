'use strict';
const express = require('express');

const router = express.Router();

const GetMenu = require('./getMenu');

const responseCache = require('./responseCache');

const removeAllergyInfo = (month, hideAllergyInfo) => {
  let singleDay = false;
  if (hideAllergyInfo) {
    if (!Array.isArray(month)) {
      month = [month];
      singleDay = true
    }
    for (const day in month) {
      if (month[day].breakfast != undefined) {
        month[day] = {
          date: month[day].date,
          breakfast: month[day].breakfast.map(menu => menu.replace(/\d|[.]/g, '')),
          lunch: month[day].lunch.map(menu => menu.replace(/\d|[.]/g, '')),
          dinner: month[day].dinner.map(menu => menu.replace(/\d|[.]/g, ''))
        };
      }
    }
    if (singleDay) {
      month = month[0]
    } 
  }
  
  return month;
}


const responseRouter = (req, res, next) => {
  const schoolCode = req.params.schoolCode;
  const schoolType = req.params.schoolType;

  const currentDate = new Date();
  const date = {
    year: req.query.year || currentDate.getFullYear(),
    month: req.query.month || currentDate.getMonth() + 1,
    date: req.query.date
  };

  const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;

  const responseJSON = responseCache.getCache(schoolCode, date.year, date.month);

  if (responseJSON) {

    responseJSON.menu = date.date ? responseJSON.menu[Number(date.date)-1] : responseJSON.menu;
    responseJSON.menu = removeAllergyInfo(responseJSON.menu, hideAllergyInfo);

    // const timeRemaining = (responseJSONCache.cacheTime - (new Date() - timeCached)) / 1000
    // responseJSON.server_message.push(`${Math.round(timeRemaining)}초 후 식단이 새로 갱신됩니다.`)

    res.json(responseJSON);
  } else {
    const getMenu = new GetMenu(schoolType, schoolCode, date);
    getMenu.fromNEIS((monthlyMenu, err) => {
      if (err) return next(err);

      responseCache.cacheMenu(schoolCode, monthlyMenu, date.year, date.month);

      responseRouter(req, res, next);
    });
  }
}

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  // responseRouter(req, res, next);
  responseCache.getCache(req.params.schoolType, req.params.schoolCode, 2018, 11, (schoolMenuCache) => {
    res.json(schoolMenuCache);
  });
});

module.exports.router = router