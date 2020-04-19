import express from "express";
import { JsonResponseBody, SchoolType, BadRequestError } from "package-common";
import { SchoolMenuService } from "./service/SchoolMenuService";
import { NeisCrawler } from "./data/NeisCrawler";
import { FirestoreAccessor } from "./data/FirestoreAccessor";
import { QueryStringOptions } from "./type/QueryStringOptions";

const app = express();

app.get('*/api/:schoolType/:schoolCode', async (req, res, next) => {
    const schoolCode = req.params.schoolCode;
    const schoolType: SchoolType = SchoolType[req.params.schoolType.toUpperCase()];
    const menuYear: number = Number(req.query.year) || new Date().getFullYear();
    const menuMonth = Number(req.query.month) || new Date().getMonth()+1;
    
    const neisCrawler = new NeisCrawler(schoolType, schoolCode, menuYear, menuMonth);
    const firestoreAccessor = new FirestoreAccessor(schoolCode, menuYear, menuMonth);
    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor);

    try {
        if (schoolType === undefined) throw new BadRequestError();

        const menu = await schoolMenuService.getSchoolMenu(req.query as QueryStringOptions);
        const jsonResponseBody = new JsonResponseBody();

        res.json(jsonResponseBody.create({ menu }));
    } catch (error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send(err.message);
});

export const schoolMenuApp = app;