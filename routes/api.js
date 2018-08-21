'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const parseMenu = require('../modules/parse_menu');
const logger = require('../modules/logger');

router.use(cors());

router.get('/:schoolType/:region/:schoolCode', (req, res) => {
  const ymd = {
    year: req.query.year,
    month: req.query.month,
    date: req.query.date
  };

  parseMenu(req.params.region, req.params.schoolCode, req.params.schoolType, ymd, (MONTHLY_TABLE, err) => {
    if (err) throw err;

    MONTHLY_TABLE.push({
      notice: ["8월 24일 이후 URL, body의 구조 변경이 있습니다: https://github.com/5d-jh/school-menu-api"]
    });

    logger({
      level: 'info',
      method: 'GET',
      optional_var: ymd
    });
  
    res.json(MONTHLY_TABLE);
  });
});

router.post('/', bodyParser.json(), (req, res) => {
  req.body.ymd = req.body.ymd || {year: '', month: '', date: ''};
  var ymd = {
    year: req.body.ymd.year,
    month: req.body.ymd.month,
    date: req.body.ymd.date
  };
  parseMenu(req.body.region, req.body.school_code, req.params.schoolType, ymd, (MONTHLY_TABLE) => {
    MONTHLY_TABLE.push({
      notice: ["8월 24일 이후 URL, body의 구조 변경이 있습니다: https://github.com/5d-jh/school-menu-api"]
    });

    logger({
      level: 'info',
      method: 'POST',
      optional_var: ymd
    });

    res.json(MONTHLY_TABLE);
  });
});

module.exports = router;