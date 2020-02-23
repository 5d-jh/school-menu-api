const express = require('express');
const { schoolMenuApp } = require('./school-menu/index');
const { schoolCodeApp } = require('./school-code/index');

const app = express();

app.use(schoolMenuApp);
app.use(schoolCodeApp);
app.listen(8080);