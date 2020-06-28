import express = require("express");
import { schoolMenuApp } from "@school-api/menu";
import { schoolInfoApp } from "@school-api/info";
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