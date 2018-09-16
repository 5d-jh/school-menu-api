// /api/
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const cors = require('cors');
const router = express.Router();

const GetMenu = require('./getMenu');

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

const regions = {A: "national", B: "sen", E: "ice", C: "pen", F: "gen", G: "dje", D: "dge", I: "sje", H: "use",
                 J: "goe", K: "kwe", M: "cbe", N: "cne", R: "gbe", S: "gne", P: "jbe", Q: "jne", T: "jje"};
const nationalHigh = {
  "A000003488": "kwe",
  "A000003490": "dge",
  "A000003495": "gne",
  "A000003496": "cne",
  "A000003509": "pen",
  "A000003561": "sen",
  "A000003516": "gen",
  "A000003520": "jbe",
  "A000003566": "jje",
  "A000003569": "cbe"
}

const blacklist = /sen|ice|pen|gen|dje|sje|use|goe|kwe|cbe|cne|gbe|gne|jbe|jne|jje/;
router.get(blacklist, (req, res, next) => {
  const err = new Error("해당 주소는 더이상 유효하지 않습니다. 변경된 인터페이스를 확인해 주세요. https://github.com/5d-jh/school-menu-api");
  err.status = 400;
  return next(err);
});

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const schoolCode = req.params.schoolCode;
  let region = regions[schoolCode[0]];
  if (!region) {
    const err = new Error('존재하지 않는 지역입니다. 학교 코드 첫 번째 자리를 다시 확인해 주세요. https://github.com/5d-jh/school-menu-api');
    err.status = 400;
    return next(err)
  }
  if (region === "national") {
    region = nationalHigh[schoolCode];
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
    server_message: require('./serverMessage.json').content
  };

  const nodb = req.query.nodb == "true" ? true : false;

  const getMenu = new GetMenu(req.params.schoolType, region, schoolCode, date);
  if (nodb) {
    getMenu.fromNEIS((monthlyTable, err) => {
      if (err) return next(err);

      responseJSON.menu = monthlyTable;
      res.json(responseJSON);
    })
  } else {
    getMenu.fromDB((monthlyTable, err) => {
      if (err) return next(err);
  
      responseJSON.menu = monthlyTable;
      res.json(responseJSON);
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

  let responseJSON = {
    menu: [],
    server_message: require('./serverMessage.json').content
  };

  const getMenu = new GetMenu(req.body.school_type, region, req.body.school_code, date);
  getMenu.fromDB((monthlyTable, err) => {
    if (err) return next(err);

    responseJSON.menu = monthlyTable;
    res.json(responseJSON);
  });
});

router.use(function (err, req, res, next) {
  console.error(err.stack);
  logger.log('error', {
    message: err.message,
    body: req.body,
    query: req.query
  });
  res.status(err.status || 500);
  res.json({server_message: [err.message || 'error occurred']});
  next(err);
});

module.exports = router;