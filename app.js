'use strict';
const express = require('express');
const process = require('process');
const winston = require('winston');
const cors = require('cors');
const os = require('os');
const app = express();

const apiRoute = require('./api/route');

console.debug(process.env.NODE_ENV);

const port = os.type() === 'Darwin' ? 8080 : process.env.PORT || 80
app.listen(port, () => {
  if (process.env.NODE_ENV != 'production') {
    console.log(`http://localhost:${port}`);
  }
});

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
let responseJSONCache = [];

app.use('/api', (req, res, next) => {
  const date = new Date();
  const hour = date.getHours();
  requestLog[hour] ? requestLog[hour] ++ : requestLog[hour] = 1;
  next();
});

app.use('/api/:schoolType/:schoolCode', (req, res, next) => { //캐시에 요청한 학교가 있는지 확인
  for (const i in responseJSONCache) {
    if (responseJSONCache[i].schoolCode === req.params.schoolCode) {
      let responseJSON = responseJSONCache[i].response;
      responseJSON.server_message.push('임시저장된 식단표 입니다.');
      res.json(responseJSON);
      responseJSON.server_message.pop();

      return;
    }
  }
  next()
});
app.use('/api', apiRoute.router); //API 요청
app.use('/api', (req, res, next) => { //API 요청 후 임시저장
  const cacheIndex = responseJSONCache.length
  apiRoute.cache.selfDestroyTrigger = () => {
    setTimeout(() => {
      responseJSONCache.splice(cacheIndex, 1);
    }, 30000);
  }
  responseJSONCache.push(apiRoute.cache);
  responseJSONCache[cacheIndex].selfDestroyTrigger();
})

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