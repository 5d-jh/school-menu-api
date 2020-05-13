import express = require("express");
import { schoolMenuApp } from "package-school-menu";
import { schoolInfoApp } from "package-school-info";
import { initializeApp } from "firebase-admin";
import { env } from "process";

if (env.NODE_ENV === "local") {
    initializeApp({
        databaseURL: "http://localhost:8080"
    });
}
else {
    initializeApp();
}

const app = express();

app.use(schoolMenuApp);
app.use(schoolInfoApp);
app.listen(5000);