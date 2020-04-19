import { https } from "firebase-functions";
import { initializeApp } from "firebase-admin";
import { schoolMenuApp } from "package-school-menu";
import { schoolInfoApp } from "package-school-info";

initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.api = https.onRequest(schoolMenuApp);
exports.code = https.onRequest(schoolInfoApp);