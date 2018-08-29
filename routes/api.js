'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const router = express.Router();

const GetMenu = require('../modules/getMenu');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: `./logs/error.log` })
  ]
});

router.use(cors());

const regions = {B: "sen", E: "ice", C: "pen", F: "gen", G: "dje", D: "dge", I: "sje", H: "use", J: "goe",
                 K: "kwe", M: "cbe", N: "cne", R: "gbe", S: "gne", P: "jbe", Q: "jne", T: "jje"};

const blacklist = /sen|ice|pen|gen|dje|sje|use|goe|kwe|cbe|cne|gbe|gne|jbe|jne|jje/;
router.get(blacklist, (req, res, next) => {
  const err = new Error("해당 주소는 더이상 유효하지 않습니다. 변경된 인터페이스를 확인해 주세요: https://github.com/5d-jh/school-menu-api");
  err.status = 400;
  return next(err);
});

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const region = regions[req.params.schoolCode[0]];
  if (!region) {
    const err = new Error('지역이 적절하지 않습니다. 학교 코드를 다시 확인해 주세요.');
    err.status = 400;
    return next(err)
  }

  const nowdate = new Date();
  const year = req.query.year || nowdate.getFullYear();
  const month = req.query.month || nowdate.getMonth() + 1;
  const date = {
    year: year,
    month: month,
    date: req.query.date
  };

  let responseJSON = {
    menu: [],
    server_message: [""]
  };

  const getMenu = new GetMenu(req.params.schoolType, region, req.params.schoolCode, date);
  if (req.query.nodb == "true") {
    getMenu.neis((fetchedTable, err) => {
      if (err) return next(err);

      responseJSON.menu = fetchedTable;
      res.json(responseJSON);
    });
  } else {
    getMenu.initSchool((err) => {
      if (err) return next(err);

      getMenu.database((table, err) => {
        if (err) return next(err);

        responseJSON.menu = table.menu;
        res.json(responseJSON);
      });
    });
  }
  
});

router.post('/', bodyParser.json(), (req, res, next) => {
  req.body.ymd = req.body.ymd || {year: '', month: '', date: ''};
  const region = regions[req.body.school_code[0]];

  const nowdate = new Date();
  let date = {
    year: req.body.ymd.year || nowdate.getFullYear(),
    month: req.body.ymd.month || nowdate.getMonth() + 1,
    date: req.body.ymd.date
  };

  const getMenu = new GetMenu(req.body.school_type, region, req.body.school_code, date);
  getMenu.initSchool((err) => {
    if (err) return next(err);
    getMenu.database((table, err) => {
      if (err) return next(err);
      let responseJSON = {
        menu: table.menu,
        server_message: [""]
      }

      res.json(responseJSON);
    });
  });
});

router.use(function (err, req, res, next) {
  console.error(err.stack);
  logger.log('error', {
    message: err.message
  });
  res.status(err.status || 500);
  res.json({server_message: [err.message || 'error occurred']});
  next(err);
});

module.exports = router;