import * as functions from 'firebase-functions';
import { msg } from 'package-common'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const api = functions.https.onRequest((request, response) => {
    response.send(msg);
});