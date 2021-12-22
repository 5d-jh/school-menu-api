import express = require("express");
import { schoolMenuApp } from "@school-api/menu";
import { schoolInfoApp } from "@school-api/info";
import { initializeApp } from "firebase-admin";
import { env } from "process";
import {AddressInfo} from "net";

let fbApp;

if (env.NODE_ENV === "local") {
    fbApp = initializeApp({
        databaseURL: "http://localhost:8080"
    });
}
else {
    fbApp = initializeApp();
}

const app = express();

app.use(schoolMenuApp(fbApp));
app.use(schoolInfoApp(fbApp));
const server = app.listen(0, () => {
    console.log(`server on ${(server.address() as AddressInfo).port}`)
});

export default app;
