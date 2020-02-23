const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');

const { crawler } = require('./src/crawler');
const package = require('../package.json');

const app = express();

const COMMON_MSGS = [
  '문제가 발생했거나 건의사항이 있는 경우 GitHub 저장소 페이지에 이슈를 남겨주세요: https://github.com/5d-jh/school-menu-api/issues',
  `v${package.version}`
];

nunjucks.configure(path.resolve(__dirname, './templates'), {
  autoescape: true,
  express: app
});

const baseUrl = '/code';

app.use(`${baseUrl}/static`, express.static(path.resolve(__dirname, './static')));

app.get(`${baseUrl}/api`, async (req, res) => {
  let statusCode = 200;
  const response = {
    school_infos: [],
    server_message: []
  };

  try {
    response.school_infos = await crawler(req.query.q, req.query.page);
    response.server_message = [
      ...COMMON_MSGS
    ];
  } catch (error) {
    if (error.status) {
      statusCode = error.status;
      response.server_message = [
        `오류: ${error.message}`,
        ...COMMON_MSGS
      ];
    }
  } finally {
    res.status(statusCode).json(response);
  }
});

app.get(`${baseUrl}/app`, async (req, res) => {
  const schoolInfos = await crawler(req.query.q, req.query.page);
  res.render('index.html', {
    query: req.query.q,
    school_infos: schoolInfos,
    page: Number(req.query.page) || 1
  });
});

exports.schoolCodeApp = app;