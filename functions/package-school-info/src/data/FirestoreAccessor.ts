import { DataAccessor } from "package-common";
import { SchoolInfo } from "../type/SchoolInfo";
import { firestore } from "firebase-admin";

export class FirestoreAccessor implements DataAccessor<SchoolInfo[]> {

    private db: firestore.Firestore;
    private ref: firestore.CollectionReference;

    private searchKeyword: string;

    constructor(searchKeyword: string) {
        this.db = firestore();
        this.ref = this.db.collection('schoolinfo');
        this.searchKeyword = searchKeyword;
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
        //TODO: Not yet implemented
    }
}