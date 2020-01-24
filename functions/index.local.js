const express = require('express');
const { routers } = require('./index');

const app = express();

app.use(routers);
app.listen(8080);