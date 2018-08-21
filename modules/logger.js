'use strict';
const winston = require('winston');

module.exports = function (infos) {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.File({ filename: `./logs/${infos.filename}.log` }),
    ],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint()
    )
  });
  logger.log(infos);
}