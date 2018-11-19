'use strict';
const express = require('express');
const process = require('process');
const winston = require('winston');
const cors = require('cors');
const app = express();

const apiRoute = require('./api/route');

app.use(cors());

app.get('*', (req, res, next) => {
  if ((req.get('X-Forwarded-Proto') === 'http') && (process.env.NODE_ENV == 'production')) {
    res.redirect(`https://${req.get('host')}${req.url}`);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.redirect('https://github.com/5d-jh/school-menu-api');
});

let requestLog = {};

app.use('/api', (req, res, next) => {
  const date = new Date();
  const hour = date.getHours();
  requestLog[hour] ? requestLog[hour] ++ : requestLog[hour] = 1;
  next();
});

app.use('/api', apiRoute.router); //API 요청

app.use('/usage', (req, res, next) => {
  res.json(requestLog);
});

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