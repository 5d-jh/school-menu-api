'use strict';
const express = require('express');
const process = require('process');
const cors = require('cors');
const app = express();

require('dotenv').config();

const apiRoute = require('./api/route');

process.env.TZ = 'Asia/Seoul';

app.use(cors());

app.use('/api', apiRoute.router); //API 요청

app.use((err, req, res, next) => { //오류 응답 미들웨어
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({menu: [], server_message: [err.message || 'error occurred']});
  next(err);
});

module.exports = app;