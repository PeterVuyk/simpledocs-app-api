import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getConfigurations = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall((data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getConfigurations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getConfigurations called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: null};
      }
      return firestore.collection('configurations')
          .doc('appConfigurations')
          .get()
          .then(
              (configurations) => {
                return {success: true, message: null, result: configurations.data()};
              }
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect configurations from firestore, reason: ' + reason);
                return {
                  success: false,
                  message: 'Failed to collect the configurations info try it again later',
                  result: null,
                };
              }
          );
    });
