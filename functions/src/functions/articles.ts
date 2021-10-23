import * as functions from 'firebase-functions';
import {appVersions} from '../appVersions';
import {firestore} from '../FirebaseAdmin';

//  TODO: later change minWidth depending on the environment, also read:
//  https://firebase.google.com/docs/functions/manage-functions#min-max-instances

export const getArticles = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall((data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getArticles called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getArticles called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: null};
      }
      if (!('bookType' in data) || !data.bookType) {
        functions.logger.info('Function getArticles called without bookType');
        return {success: false, message: 'Missing bookType or provided bookType not supported', result: null};
      }

      functions.logger.info(
          'getArticles request for bookType ' + data.bookType + ' received for version: ' + data.appVersion,
          {structuredData: true}
      );

      return firestore.collection('books').doc(data.bookType.trim()).collection(data.bookType.trim())
          .where('isDraft', '==', false)
          .get()
          .then((article) => {
            return {success: true, message: null, result: article.docs.map((doc) => doc.data())};
          })
          .catch(
              (reason) => {
                functions.logger.error('failed to collect articles from firestore, reason: ' + reason);
                return {success: false, message: 'Failed to collect the articles info try it again later', result: []};
              }
          );
    });
