import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getConfigurations = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getConfigurations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getConfigurations called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: null};
      }
      let isProduction = true;
      if ('environment' in data) {
        isProduction = !['staging'].includes(data.environment);
      }

      try {
        const result = isProduction ? await getConfigurationsPublished() : await getConfigurationsDrafts();
        functions.logger.info('result', JSON.stringify(result));
        return {success: true, message: null, result};
      } catch (error) {
        functions.logger.error('failed to collect configurations from firestore, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the configurations info try it again later',
          result: null,
        };
      }
    });

const getConfigurationsDrafts = async () => {
  const doc = await firestore.collection('configurations').doc('appConfigurationsDraft').get();
  if (doc.exists) {
    const appConfigurations = await getConfigurationsPublished();
    return {...doc.data(), versioning: appConfigurations!.versioning};
  }
  return getConfigurationsPublished();
};

const getConfigurationsPublished = async () => {
  return firestore.collection('configurations')
      .doc('appConfigurations')
      .get()
      .then((configurations) => configurations.data());
};
