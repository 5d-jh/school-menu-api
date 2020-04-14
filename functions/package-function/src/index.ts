import { https } from "firebase-functions";
import { initializeApp } from "firebase-admin";
import { schoolMenuApp } from "package-school-menu"

initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const api = https.onRequest(schoolMenuApp);