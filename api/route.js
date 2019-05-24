'use strict';
const express = require('express');

const router = express.Router();

const responseCache = require('./responseCache');

const removeAllergyInfo = (month, hideAllergyInfo) => {
  const regex = /\d|[.]|[*]/g;
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
          breakfast: month[day].breakfast.map(menu => menu.replace(regex, '')),
          lunch: month[day].lunch.map(menu => menu.replace(regex, '')),
          dinner: month[day].dinner.map(menu => menu.replace(regex, ''))
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

  responseCache(req.params.schoolType, req.params.schoolCode, menuYear, menuMonth).require()
  .then((schoolMenuData) => {
    const responseJSON = {
      menu: schoolMenuData.schoolMenu,
      server_message: []
    };

    const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;
    const menuDate = Number(req.query.date);

    if (menuDate) responseJSON.menu =responseJSON.menu[menuDate-1];
    responseJSON.menu = removeAllergyInfo(responseJSON.menu, hideAllergyInfo);

    responseJSON.server_message.push(...require('./serverMessage.json').content);
    responseJSON.server_message.push(
      schoolMenuData.isCached ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.'
    );

    res.json(responseJSON);
  })
  .catch(err => next(err));
});

module.exports.router = router;