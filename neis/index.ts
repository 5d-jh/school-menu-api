import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import schoolinfo from './data-accessors/schoolinfo';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const q: string = req.query.q;

    if (!Boolean(q)) {
        context.res = {
            status: 400,
            body: "Parameter 'q' not found."
        }
        return;
    }

    try {
        const data = await schoolinfo(q, Number(req.query.page))

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: error
        };
    }

    


    // context.log('HTTP trigger function processed a request.');
    // const name = (req.query.name || (req.body && req.body.name));

    // if (name) {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         body: "Hello " + (req.query.name || req.body.name)
    //     };
    // }
    // else {
    //     context.res = {
    //         status: 400,
    //         body: "Please pass a name on the query string or in the request body"
    //     };
    // }
};

export default httpTrigger;
