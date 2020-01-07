import nunjucks from 'nunjucks';

import schoolinfo from '../data-accessors/schoolinfo';
import DB from '../data-accessors/db';

export default async (q: string, page: string) => {
    const data = await schoolinfo(q, page);

    if (q) {
        const db = new DB();
        let result = await db.get(q);

        if (result.length === 0) {
            result = await schoolinfo(q, page);
            db.put(result); 
        }

        db.close();
    }

    nunjucks.configure('neis/views');
    return nunjucks.render('./index.html', {
        query: q,
        school_infos: data,
        is_all: true
    });
}