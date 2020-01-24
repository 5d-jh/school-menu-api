const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const { menuService } = require('./menu/service');
const package = require('./package.json');

admin.initializeApp();

const app = express();

const COMMON_MSGS = [
  '문제가 발생했거나 건의사항이 있는 경우 GitHub 저장소 페이지에 이슈를 남겨주세요: https://github.com/5d-jh/school-menu-api/issues',
  `v${package.version}`
];

app.get('/api/:schoolType/:schoolCode', async (req, res) => {
  let statusCode = 200;
  const response = {
    menu: [],
    server_message: []
  };

  try {
    const data = await menuService(req.params.schoolType, req.params.schoolCode, req.query);
    response.menu = data.menu;
    response.server_message = [
      data.isFetchedFromDB ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.',
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

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.api = functions.https.onRequest(app);