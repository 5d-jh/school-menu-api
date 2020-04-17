import { DataAccessor } from "package-common";
import { SchoolInfo } from "../type/SchoolInfo";
import { Firestore, CollectionReference } from "@google-cloud/firestore";
import path from "path";

export class FirestoreAccessor implements DataAccessor<SchoolInfo[]> {

    private db: Firestore;
    private ref: CollectionReference;

    private searchKeyword: string;

    constructor(searchKeyword: string) {
        this.db = process.env.NODE_ENV === 'ci' ? (
            new Firestore({
                keyFilename: path.resolve(__dirname, '../school-api-265018-0ae0e4cd0267.json')
            })
        ) : (
            new Firestore()
        );

        this.ref = this.db.collection('schoolinfo');
        this.searchKeyword = searchKeyword;
    }

    async get() : Promise<SchoolInfo[]> {
        return this.ref
            .where("keywords", "array-contains", this.searchKeyword)
            .get()
            .then(({ docs }) => docs.map(doc => doc.data() as SchoolInfo))
    }

    put() {
        //TODO: Not yet implemented
    }
}