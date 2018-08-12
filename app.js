'use strict';
const express = require('express');
const process = require('process');
const os = require('os');
const cors = require('cors');
const app = express();

app.use(cors());

console.log(process.env.NODE_ENV);

var port;
os.type() === 'Darwin' ? port = 8080 : port = process.env.PORT || 80
app.listen(port, () => {
  if (process.env.NODE_ENV != 'production') {
    console.log(`http://localhost:${port}`);
  }
});

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

app.use('/api', require('./routes/api'));