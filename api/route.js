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

  responseCache.getCache(req.params.schoolType, req.params.schoolCode, menuYear, menuMonth, (schoolMenuCache) => {
    const responseJSON = {
      menu: schoolMenuCache.schoolMenu,
      server_message: ''
    };

    const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;
    const date = req.query.date;

    responseJSON.menu = date ? responseJSON.menu[Number(date)-1] : responseJSON.menu;
    responseJSON.menu = removeAllergyInfo(responseJSON.menu, hideAllergyInfo);

    res.json(responseJSON);
  });
});

module.exports.router = router