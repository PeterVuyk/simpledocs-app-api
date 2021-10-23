import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getCalculations = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall((data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getCalculations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getCalculations called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: null};
      }

      return firestore.collection('calculations')
          .where('isDraft', '==', false)
          .get()
          .then((calculationInfo) => {
            return {success: true, message: null, result: calculationInfo.docs.map((doc) => doc.data())};
          })
          .catch(
              (reason) => {
                functions.logger.error('failed to collect calculations from firestore, reason: ' + reason);
                return {
                  success: false,
                  message: 'Failed to collect the calculation info try it again later',
                  result: [],
                };
              }
          );
    });
