'use strict';
const express = require('express');

const router = express.Router();

const ResponseCache = require('./ResponseCache');

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
  const menuYear = Number(req.query.year) || new Date().getFullYear();
  const menuMonth = Number(req.query.month) || new Date().getMonth()+1;

  const responseCache = new ResponseCache(req.params.schoolType, req.params.schoolCode, menuYear, menuMonth);
  responseCache.getCache()
  .then((schoolMenuData) => {
    const responseJSON = {
      menu: schoolMenuData.schoolMenu,
      server_message: []
    };

    let remainingMessage;
    if (!schoolMenuData.expiry) {
      remainingMessage = `${menuYear}년 ${menuMonth}월에 해당하는 급식이 없는 것으로 간주되어 임시저장하지 않습니다.`;
    } else {
      const remainingTime = new Date(schoolMenuData.expiry).getTime() - new Date().getTime();
      const remainingDays = Math.floor(remainingTime / 86400000);
      const remainingHours = Math.floor(remainingTime / (3600000 * (remainingDays+1)));
      remainingMessage = `${remainingDays}일 ${remainingHours}시간`;
      if ((remainingDays && remainingHours) === 0) {
        const remainingMins = Math.floor(remainingTime / 60000);
        const remainingSecs = Math.ceil((remainingTime / 1000) % 60);
        remainingMessage += ` ${remainingMins}분 ${remainingSecs}초`;
      };
      remainingMessage += ` 후 식단이 갱신됩니다.`;
    }

    const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;
    const date = req.query.date;

    responseJSON.menu = date ? responseJSON.menu[Number(date)-1] : responseJSON.menu;
    responseJSON.menu = removeAllergyInfo(responseJSON.menu, hideAllergyInfo);

    responseJSON.server_message.push(...require('./serverMessage.json').content);
    responseJSON.server_message.push(remainingMessage);

    res.json(responseJSON);
  })
  .catch(err => next(err));
  /*responseCache.getCache(, (schoolMenuCache, err) => {

  }); */
});

module.exports.router = router;