'use strict';
const winston = require('winston');

module.exports = function (infos) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({ filename: './logs/api_get_200.log' }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint()
    )
  });
  logger.log(infos);
}