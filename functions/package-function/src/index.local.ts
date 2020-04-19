import express = require("express");
import { schoolMenuApp } from "package-school-menu";
import { schoolInfoApp } from "package-school-info";
import { initializeApp } from "firebase-admin";

initializeApp();

const app = express();

app.use(schoolMenuApp);
app.use(schoolInfoApp);
app.listen(5000);