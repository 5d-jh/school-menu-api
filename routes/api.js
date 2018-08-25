'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const GetMenu = require('../modules/getMenu');
const logger = require('../modules/logger');

const logErrors = (err, req, res, next) => {
  logger({
    filename: 'error',
    err_info: err,
    req_info: req
  });
  next(err)
}
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(400).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(400).send('서버 요류..');
}

router.use(cors());
router.use(logErrors);
router.use(clientErrorHandler);
router.use(errorHandler);

const regions = {B: "sen", E: "ice", C: "pen", F: "gen", G: "dje", D: "dge", I: "sje", H: "use", J: "goe",
                 K: "kwe", M: "cbe", N: "cne", R: "gbe", S: "gne", P: "jbe", Q: "jne", T: "jje"};

const blacklist = /sen|ice|pen|gen|dje|sje|use|goe|kwe|cbe|cne|gbe|gne|jbe|jne|jje/;
router.get(blacklist, (req, res, next) => {
  res.status(400).json({
    server_message: ["해당 주소는 더이상 유효하지 않습니다. 변경된 인터페이스를 확인해 주세요: https://github.com/5d-jh/school-menu-api"]
  });
});

router.get('/:schoolType/:schoolCode', (req, res, next) => {
  const region = regions[req.params.schoolCode[0]];

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
    console.debug("no database")
    getMenu.neis(fetchedTable => {
      responseJSON.menu = fetchedTable;
      res.json(responseJSON);
    });
  } else {
    getMenu.initSchool((err) => {
      if (err) return next(err);
      getMenu.database((table, err) => {
        if (err) return next(err);

        responseJSON.menu = table.menu;

        logger({
          filename: 'GET200',
          req_params: req.params,
          req_query: req.query
        });

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

      logger({
        filename: 'POST200',
        req_body: req.body
      });

      res.json(responseJSON);
    });
  });
});

module.exports = router;