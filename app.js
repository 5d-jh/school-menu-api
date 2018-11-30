'use strict';
const express = require('express');
const process = require('process');
const winston = require('winston');
const cors = require('cors');
const app = express();

const apiRoute = require('./api/route');

process.env.TZ = 'Asia/Seoul';

app.use(cors());

app.use('/api', apiRoute.router); //API 요청

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: `./logs/error.log` })
  ]
});
app.use((err, req, res, next) => { //오류 응답 미들웨어
  console.error(err.stack);
  logger.log('error', {
    message: err.message,
    body: req.body,
    query: req.query
  });
  res.status(err.status || 500);
  res.json({menu: [], server_message: [err.message || 'error occurred']});
  next(err);
});

module.exports = app;