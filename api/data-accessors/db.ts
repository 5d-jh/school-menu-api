import { MongoClient } from 'mongodb';

import { SchoolMenuTable } from '../types';
import Database from '../../global/interfaces/database';

export default class implements Database {

    private client: MongoClient;

    private schoolCode: string;
    private menuYear: Number;
    private menuMonth: Number;

    constructor(schoolCode: string, menuYear: Number, menuMonth: Number) {
        let url = process.env.DB_URL;
        if (!url) {
            console.warn("환경 변수 'DB_URL'의 값이 비어 있습니다. localhost로 연결을 시도합니다.");
            url = 'mongodb://localhost:27017';
        }
        this.client =  new MongoClient(url, { useUnifiedTopology: true });
        this.schoolCode = schoolCode;
        this.menuYear = menuYear;
        this.menuMonth = menuMonth;
    }

    private async connect() {
        return (await this.client.connect()).db("schoolmenuapi").collection("schoolmenu");
    }

    async get(): Promise<SchoolMenuTable[]|null> {
        const mongo = await this.connect();

        const result = await mongo.findOne({
            schoolCode: this.schoolCode,
            menuYear: this.menuYear,
            menuMonth: this.menuMonth
        });

        return result ? result.menu : null;
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

    async close() {
        return this.client.close();
    }

}