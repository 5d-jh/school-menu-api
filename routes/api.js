'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();

const parseMenu = require('../modules/parse_menu');
const logger = require('../modules/logger');

router.use(cors());

router.get('/:region/:school_code', (req, res) => {
  var ymd = {
    year: req.query.year,
    month: req.query.month,
    date: req.query.date
  };
  parseMenu(req.params.region, req.params.school_code, ymd, (MONTHLY_TABLE) => {
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
  parseMenu(req.body.region, req.body.school_code, ymd, (MONTHLY_TABLE) => {
    logger({
      level: 'info',
      method: 'POST',
      optional_var: ymd
    });

    res.json(MONTHLY_TABLE);
  });
});

module.exports = router;