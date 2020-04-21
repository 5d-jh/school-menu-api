import express, { json } from "express";
import { JsonResponseBody, ErrorResponseBody } from "package-common";
import path from "path";
import { FirestoreAccessor } from "./data/FirestoreAccessor";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure(path.resolve(__dirname, "../../view"), {
    autoescape: true,
    express: app
});

app.use("/code/static", express.static(path.resolve(__dirname, "../../static")));

app.get("*/code/api", async (req, res, next) => {
    const firestoreAccessor = new FirestoreAccessor(req.query.q as string || '');

    try {
        const jsonResponseBody = new JsonResponseBody();
        res.json(
            jsonResponseBody.create({
                school_infos: await firestoreAccessor.get()
            })
        );
    } catch (error) {
        next(error);
    }
});

app.get("*/code/app", async (req, res, next) => {
    const firestoreAccessor = new FirestoreAccessor(req.query.q as string || '');
    try {
        res.render("index.html", {
            query: req.query.q,
            school_infos: await firestoreAccessor.get(),
            page: Number(req.query.page) || 1
        });
    } catch (error) {
        next(error);
    }
    
});

app.use(ErrorResponseBody("school_infos"));

export const schoolInfoApp = app;