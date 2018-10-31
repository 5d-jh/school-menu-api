'use strict';
const express = require('express');

const router = express.Router();

const GetMenu = require('./getMenu');

const responseJSONCache = [];

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

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const schoolCode = req.params.schoolCode;

  const currentDate = new Date();
  const year = req.query.year || currentDate.getFullYear();
  const month = req.query.month || currentDate.getMonth() + 1;
  const date = {
    year: year,
    month: month
  };

  

  for (const i in responseJSONCache) {
    if ((responseJSONCache[i].year == year) && (responseJSONCache[i].month == month) && (responseJSONCache[i].schoolCode == schoolCode)) {
      const responseJSON = responseJSONCache[i].response;

      const timeRemaining = (30000 - (new Date() - responseJSONCache[i].timeCached)) / 1000;
      responseJSON.server_message.push(`임시저장된 식단입니다. ${timeRemaining}초 뒤 삭제됩니다.`);

      res.json(responseJSON);

      responseJSON.server_message.pop();
      return;
    }
  }

  // const nodb = req.query.nodb === "true" ? true : false;
  const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;

  const getMenu = new GetMenu(req.params.schoolType, schoolCode, date);
  getMenu.fromNEIS((monthlyTable, err) => {
    if (err) return next(err);

    const responseJSON = {
      menu: [],
      server_message: require('./serverMessage.json').content
    };

    responseJSON.menu = removeAllergyInfo(monthlyTable, hideAllergyInfo);

    const cacheIndex = responseJSONCache.length
    responseJSONCache.push({
      response: responseJSON,
      schoolCode: schoolCode,
      year: year,
      month: month,
      timeCached: new Date(),
      selfDestroyTrigger: () => {
        setTimeout(() => {
          responseJSONCache.splice(cacheIndex, 1);
        }, 30000);
      }
    });
    responseJSONCache[cacheIndex].selfDestroyTrigger();
    console.log(responseJSONCache.length)

    responseJSON.menu = req.query.date ? responseJSON.menu[Number(req.query.date)-1] : responseJSON.menu;
    res.json(responseJSON);
  });
});

module.exports.router = router