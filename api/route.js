'use strict';
const express = require('express');

const router = express.Router();

const GetMenu = require('./getMenu');



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

  let responseJSON = {
    menu: [],
    server_message: require('./serverMessage.json').content
  };

  // const nodb = req.query.nodb === "true" ? true : false;
  const hideAllergyInfo = req.query.hideAllergy === "true" ? true : false;

  const getMenu = new GetMenu(req.params.schoolType, schoolCode, date);
  getMenu.fromNEIS((monthlyTable, err) => {
    if (err) return next(err);

    monthlyTable = req.query.date ? monthlyTable[Number(req.query.date)-1] : monthlyTable;
    responseJSON.menu = removeAllergyInfo(monthlyTable, hideAllergyInfo);
    
    res.json(responseJSON);
    
    

    module.exports.cache = {
      response: responseJSON,
      schoolCode: schoolCode,
      month: month,
      timeCached: new Date()
    };
    next();
  });
});

module.exports.router = router