import * as admin from 'firebase-admin';
import 'firebase-functions';

const FirebaseAdmin =
  admin.apps.length === 0 ?
    admin.initializeApp() :
    admin.app();

export const firestore = FirebaseAdmin.firestore();
