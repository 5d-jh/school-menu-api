import { DataAccessor } from "package-common";
import { SchoolMenu } from "../type/SchoolMenu";
import { Firestore, CollectionReference } from "@google-cloud/firestore";
import path from "path";

export class FirestoreAccessor implements DataAccessor<SchoolMenu[]> {

    private db: Firestore;
    private ref: CollectionReference;

    private schoolCode: string;
    private menuYear: number;
    private menuMonth: number;

    constructor(schoolCode: string, menuYear: number, menuMonth: number) {
        this.db = process.env.NODE_ENV === 'ci' ? (
            new Firestore({
                keyFilename: path.resolve(__dirname, '../school-api-265018-0ae0e4cd0267.json')
            })
        ) : (
            new Firestore()
        );

        this.ref = this.db.collection('schoolmenu');

        this.schoolCode = schoolCode;
        this.menuYear = menuYear;
        this.menuMonth = menuMonth;
    }

    async get(): Promise<SchoolMenu[]> {
        const snapshots = await this.ref
            .where("schoolCode", "==", this.schoolCode)
            .where("menuYear", "==", this.menuYear)
            .where("menuMonth", "==", this.menuMonth)
            .get();
        
        if (snapshots.docs.length == 0) {
            return null;
        }

        return snapshots.docs[0].data().menu as SchoolMenu[];
    }

    async put(menu: SchoolMenu[]) {
        return await this.ref.doc().set({
            menu,
            version: 2,
            schoolCode: this.schoolCode,
            menuYear: this.menuYear,
            menuMonth: this.menuMonth
        });
    }

    close() {
        this.db.terminate();
    }
}