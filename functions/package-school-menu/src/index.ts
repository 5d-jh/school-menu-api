import express from "express";
import { JsonResponseBody, SchoolType, BadRequestError, ErrorResponseBody } from "package-common";
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
        if (schoolType === undefined) throw new BadRequestError("학교 유형이 잘못되었습니다.");

        const menu = await schoolMenuService.getSchoolMenu(req.query as QueryStringOptions);
        const jsonResponseBody = new JsonResponseBody();

        jsonResponseBody.addMessage(
            schoolMenuService.checkIfMenuIsFetchedFromDB() ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.'
        )
        res.json(jsonResponseBody.create({ menu }));
    } catch (error) {
        next(error);
    }
});

app.use(ErrorResponseBody("menu"));

export const schoolMenuApp = app;