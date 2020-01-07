import { MongoClient } from 'mongodb';

import { SchoolInfoType } from '../types';
import Database from '../../global/interfaces/database';

export default class implements Database {

    private client: MongoClient;

    constructor() {
        let url = process.env.DB_URL; 
        if (!url) {
            console.warn("환경 변수 'DB_URL'의 값이 비어 있습니다. localhost로 연결을 시도합니다.");
            url = 'mongodb://localhost:27017';
        }
        this.client =  new MongoClient(url, { useUnifiedTopology: true });
    }

    private async connect() {
        return (await this.client.connect()).db("schoolmenuapi").collection("schoolinfo");
    }

    async get(keyword: string): Promise<SchoolInfoType[]> {
        const mongo = await this.connect();

        return await mongo.find({ name: RegExp(`${keyword}`) })
        .toArray();
    }

    async put(info: SchoolInfoType[]) {
        const mongo = await this.connect();

        return await mongo.insertMany(info);
    }

    async close() {
        return this.client.close();
    }

}