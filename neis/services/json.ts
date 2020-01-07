import schoolinfo from '../data-accessors/schoolinfo';
import DB from '../data-accessors/db';

export default async (q: string, page: string): Promise<string> => {
    if (!q) {
        throw Error("Parameter 'q' not found.");
    }

    const db = new DB();
    let result = await db.get(q);

    if (!result) {
        result = await schoolinfo(q, page);
        db.put(result); 
    }

    db.close();

    return JSON.stringify(result);
}