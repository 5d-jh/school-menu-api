'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const parseMenu = require('../modules/getMenuFromNEIS');
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

const blacklist = /sen|ice|pen|gen|dje|sje|use|goe|kwe|cbe|cne|gbe|gne|jbe|jne|jje/;
router.get(blacklist, (req, res, next) => {
  res.json({
    server_message: ["해당 주소는 더이상 유효하지 않습니다. 변경된 인터페이스를 확인해 주세요: https://github.com/5d-jh/school-menu-api"]
  });
});

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const ymd = {
    year: req.query.year,
    month: req.query.month,
    date: req.query.date
  };
  const region = regions[req.params.schoolCode[0]];

  parseMenu(region, req.params.schoolCode, req.params.schoolType, ymd, (MONTHLY_TABLE, err) => {
    if (err) throw err;

    let responseJSON = {
      menu: MONTHLY_TABLE,
      server_message: []
    };

    logger({
      filename: 'GET200',
      level: 'info',
      req_query: req.query,
      req_params: req.params
    });
  
    res.json(responseJSON);
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

    let responseJSON = {
      menu: MONTHLY_TABLE,
      server_message: []
    };

    logger({
      filename: 'POST200',
      level: 'info',
      req_body: req.body
    });

    res.json(responseJSON);
  });
});

module.exports = router;