import * as express from "express";
import { schoolMenuApp } from "package-school-menu";
import { schoolInfoApp } from "package-school-info";

const app = express();

app.use(schoolMenuApp);
app.use(schoolInfoApp);
app.listen(8080);