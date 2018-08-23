'use strict';
const express = require('express');
const router = express.Router();

const GetMenu = require('../modules/getMenu');

router.get('/api/:type/:region/:code', (req, res) => {
  const getMenu = new GetMenu(req.params.type, req.params.region, req.params.code);
  getMenu.initSchool(() => {
    getMenu.database(monthlyTable => {
      let responseJson = {
        menu: monthlyTable.menu,
        server_message: [""]
      }
      res.json(responseJson);
    });
  });
});

module.exports = router;