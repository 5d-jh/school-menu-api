import express from "express";
import { JsonResponseBody } from "package-common";
import { SchoolMenuService } from "./service/SchoolMenuService";

const app = express();

app.get('/api/:schoolType/:schoolCode', async (req, res) => {

       
});

export const schoolMenuApp = app;