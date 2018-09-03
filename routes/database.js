'use strict';
const express = require('express');
const winston = require('winston');
const bodyParser = require('body-parser');
const router = express.Router();

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.File({ filename: `./logs/error.log` })
  ]
});

module.exports = (accessKey) => {
  router.post('/insertMany', bodyParser.json(), (req, res, next) => {
    if (req.body.key === accessKey) {
      try {
        const School = require(`../models/${req.body.model}`);
  
        School.insertMany(req.body.datas, (err) => {
          if (err) return next(err);
          res.status(200);
          res.json({
            server_message: ["Uploaded successfully"]
          });
        });
      } catch (err) {
        return next(err)
      }
    } else {
      res.status(403);
      res.json({
        server_message: ["Invalid access key"]
      });
    }
  });

  router.use((err, req, res, next) => {
    console.error(err.stack);
    logger.log('error', {
      message: err.message,
      body: req.body,
      query: req.query
    });
    res.status(err.status || 500);
    res.json({server_message: [err.message || 'error occurred']});
    next(err);
  });

  return router;
}