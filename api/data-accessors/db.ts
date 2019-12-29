import { MongoClient } from 'mongodb';

import { SchoolMenuTable } from '../types';

export default class {

    private client: MongoClient;

    private schoolCode: string;
    private menuYear: Number;
    private menuMonth: Number;

    constructor(schoolCode: string, menuYear: Number, menuMonth: Number) {
        this.client =  new MongoClient(
            process.env.DB_URL || "mongodb://localhost:27017"
        );
        this.schoolCode = schoolCode;
        this.menuYear = menuYear;
        this.menuMonth = menuMonth;
    }

    private async connect() {
        return (await this.client.connect()).db("schoolmenuapi").collection("schoolmenu");
    }

    async get(): Promise<SchoolMenuTable[]|null> {
        const mongo = await this.connect();

        return await mongo.findOne({
            schoolCode: this.schoolCode,
            menuYear: this.menuYear,
            menuMonth: this.menuMonth
        });
    }

    async put(menu: SchoolMenuTable[]) {
        const mongo = await this.connect();

        return await mongo.insertOne({
            schoolCode: this.schoolCode,
            menuYear: this.menuYear,
            menuMonth: this.menuMonth,
            version: 2,
            menu
        });
    }

}