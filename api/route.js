'use strict';
const express = require('express');
const neis = require('./neis');
const DB = require('./db');

const router = express.Router();

require('dotenv').config();

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

router.get('/:schoolType/:schoolCode', async (req, res, next) => {
  const menuYear = Number(req.query.year) || new Date().getFullYear();
  const menuMonth = Number(req.query.month) || new Date().getMonth()+1;

  const db = new DB(req.params.schoolCode, menuYear, menuMonth);
  let menu = await db.get();

  const isFetchedFromDB = Boolean(menu);

  if (!isFetchedFromDB) {
    //DB에 메뉴가 저장되어 있지 않은 경우
    const neisData = await neis(req.params.schoolType, req.params.schoolCode, menuYear, menuMonth)
    .catch(err => next(err));

    menu = neisData.menu;

    if (neisData.shouldSave) {
      db.put(neisData.menu)
      .catch(err => next(err));
    }
  }

  res.json({
    menu: applyOptions({
      hideAllergy: req.query.hideAllergy === "true" ? true : false,
      date: req.query.date
    }, menu),
    server_message: [
      ...JSON.parse(process.env.SERVER_MSGS),
      isFetchedFromDB ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.'
    ]
  });
});

module.exports.router = router;