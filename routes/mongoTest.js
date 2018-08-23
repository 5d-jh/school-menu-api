'use strict';
const express = require('express');
const router = express.Router();

const GetMenu = require('../modules/getMenu');

router.get('/api/:type/:region/:code', (req, res) => {
  let nowdate = new Date();
  let year = req.query.year || nowdate.getFullYear();
  let month = req.query.month || nowdate.getMonth() + 1;
  let date = new Date(year, month, req.query.date);
  const getMenu = new GetMenu(req.params.type, req.params.region, req.params.code, date);
  getMenu.initSchool(() => {
    getMenu.database(table => {
      let responseJson = {
        menu: table.menu,
        server_message: [""]
      }
      res.json(responseJson);
    });
  });
});

module.exports = router;