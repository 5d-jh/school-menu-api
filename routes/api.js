'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const parseMenu = require('../modules/parse_menu');
const logger = require('../modules/logger');

const logErrors = (err, req, res, next) => {
  logger({
    filename: 'error',
    err_info: err,
    req_info: req
  });
  next(err)
}
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(400).send(err);
}

router.use(cors());
router.use(logErrors);
router.use(errorHandler);

const regions = {B: "sen", E: "ice", C: "pen", F: "gen", G: "dje", D: "dge", I: "sje", H: "use", J: "goe",
                 K: "kwe", M: "cbe", N: "cne", R: "gbe", S: "gne", P: "jbe", Q: "jne", T: "jje"};

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const ymd = {
    year: req.query.year,
    month: req.query.month,
    date: req.query.date
  };
  const region = regions[req.params.schoolCode[0]];

  parseMenu(region, req.params.schoolCode, req.params.schoolType, ymd, (MONTHLY_TABLE, err) => {
    if (err) throw err;

    MONTHLY_TABLE.push({
      notice: ["8월 24일 이후 URL, body의 구조 변경이 있습니다: https://github.com/5d-jh/school-menu-api"]
    });

    logger({
      filename: 'GET200',
      level: 'info',
      req_query: req.query,
      req_params: req.params
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

  const region = regions[req.body.school_code[0]];

  parseMenu(region, req.body.school_code, req.body.school_type, ymd, (MONTHLY_TABLE, err) => {
    if (err) throw err;
    MONTHLY_TABLE.push({
      notice: ["8월 24일 이후 URL, body의 구조 변경이 있습니다: https://github.com/5d-jh/school-menu-api"]
    });

    logger({
      filename: 'POST200',
      level: 'info',
      req_body: req.body
    });

    res.json(MONTHLY_TABLE);
  });
});

module.exports = router;