import { AzureFunction, Context, HttpRequest } from '@azure/functions';

import service from './service';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    const { schoolType, schoolCode } = context.bindingData;

    const SERVER_MSGS = [
        "버그 신고 및 문의: https://github.com/5d-jh/school-menu-api/issues",
        "릴리즈 노트: https://github.com/5d-jh/school-menu-api/releases",
        `v${process.env.npm_package_version}`
    ];

    await service(schoolType, schoolCode, req.query)
    .then(
        ({ menu, isFetchedFromDB }) => {
            context.res = {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    menu,
                    server_message: [
                        ...SERVER_MSGS,
                        isFetchedFromDB ? "자체 서버에서 데이터를 불러왔습니다.": "NEIS에서 데이터를 불러왔습니다."
                    ]
                })
            }
        }
    )
    .catch(
        err => {
            context.res = {
                stauts: 500,
                body: JSON.stringify({
                    error: err,
                    menu: [],
                    server_message: [...SERVER_MSGS],
                })
            }
        }
    );

    // req.params.dsdf

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
