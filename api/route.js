'use strict';
const express = require('express');

const router = express.Router();

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

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const menuYear = Number(req.query.year) || new Date().getFullYear();
  const menuMonth = Number(req.query.month) || new Date().getMonth()+1;

  responseCache.getCache(req.params.schoolType, req.params.schoolCode, menuYear, menuMonth, (schoolMenuCache, err) => {
    if (err) throw err;

    if (!schoolMenuCache.schoolMenu) {
      return res.redirect(req.originalUrl);
    }

    const responseJSON = {
      menu: schoolMenuCache.schoolMenu,
      server_message: []
    };

    const remainingDate = new Date(schoolMenuCache.expiry).getTime() - new Date().getTime();
    const remainingDays = Math.floor(remainingDate / 86400000);
    const remainingHours = Math.floor(remainingDate / (3600000 * (remainingDays+1)));
    let remainingMessage = `${remainingDays}일 ${remainingHours}시간`;
    if (remainingHours === 0) {
      const remainingMins = Math.round(remainingDate / 60000);
      const remainingSecs = Math.ceil((remainingDate / 1000) % remainingMins);
      remainingMessage += ` ${remainingMins}분 ${remainingSecs}초`;
    };

    remainingMessage += ` 후 식단이 갱신됩니다.`;

    const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;
    const date = req.query.date;

    responseJSON.menu = date ? responseJSON.menu[Number(date)-1] : responseJSON.menu;
    responseJSON.menu = removeAllergyInfo(responseJSON.menu, hideAllergyInfo);

    responseJSON.server_message.push(remainingMessage);

    res.json(responseJSON);
  });
});

module.exports.router = router