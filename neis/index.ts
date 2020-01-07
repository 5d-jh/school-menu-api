import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import app from './services/html';
import api from './services/json';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    switch (context.bindingData.interface) {
        case 'app': {
            await app(req.query.q, req.query.page)
            .then(
                body => {
                    context.res = {
                        code: 200,
                        headers: { "Content-Type": "text/html; charset=UTF-8" },
                        body
                    };
                }
            )
            .catch(
                err => {
                    context.res = {
                        code: 500,
                        body: err
                    };
                }
            );
            break;
        }

        case 'api': {
            await api(req.query.q, req.query.page)
            .then(
                body => {
                    context.res = {
                        code: 200,
                        headers: { "Content-Type": "application/json" },
                        body
                    }
                }
            )
            .catch(
                err => {
                    context.res = {
                        code: 500,
                        body: err
                    }
                }
            );
            break;
        }
    
        default:
            context.res = {
                code: 301,
                headers: { "Content-Location": "https://github.com" }
            }
            break;
    }
};

export default httpTrigger;
