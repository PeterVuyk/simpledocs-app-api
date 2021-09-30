import * as admin from 'firebase-admin';
import 'firebase-functions';

admin.initializeApp();
export const db = admin.firestore();
