import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getDecisionTree = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall((data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getDecisionTree called but user not authenticated');
        return {success: false, message: 'Authentication required', result: []};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getDecisionTree called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: []};
      }
      return firestore.collection('decisionTree')
          .where('isDraft', '==', false)
          .get()
          .then((decisionTree) => {
            return {success: true, message: null, result: decisionTree.docs.map((doc) => doc.data())};
          })
          .catch(
              (reason) => {
                functions.logger.error('failed to collect decisionTree from firestore, reason: ' + reason);
                return {
                  success: false,
                  message: 'Failed to collect the decisionTree info try it again later',
                  result: [],
                };
              }
          );
    });
