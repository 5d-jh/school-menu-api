import { DataAccessor, InternalServerError } from "@school-api/common";
import { SchoolInfo } from "../type/SchoolInfo";
import { firestore } from "firebase-admin";

const collectionName = 'schoolinfo';

export class SchoolInfoDataAccessor implements DataAccessor<SchoolInfo[]> {

    private db: firestore.Firestore;
    private ref: firestore.CollectionReference;

    private searchKeyword: string;

    constructor(db: firestore.Firestore) {
        this.db = db;
        this.ref = this.db.collection(collectionName);
    }

    setParameters(searchKeyword: string): DataAccessor<SchoolInfo[]> {
        this.searchKeyword = searchKeyword;

        return this;
    }

    async get() : Promise<SchoolInfo[]> {
        return this.ref
            .where("keywords", "array-contains", this.searchKeyword)
            .get()
            .then(({ docs }) => docs.map(doc => doc.data()))
            .then(
                data => data.map(schoolInfo => ({
                    code: schoolInfo.code,
                    address: schoolInfo.address,
                    name: schoolInfo.name
                } as SchoolInfo))
            );
    }

    put() {
        throw new InternalServerError("Function not yet implemented");
    }

    close() {
        this.db.terminate();
    }
}