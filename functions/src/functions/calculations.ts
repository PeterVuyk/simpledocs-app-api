import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getCalculations = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getCalculations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getCalculations called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: null};
      }
      let isProduction = true;
      if ('environment' in data) {
        isProduction = !['staging'].includes(data.environment);
      }

      try {
        const result = isProduction ? await getCalculationsPublished() : await getCalculationsDrafts();
        functions.logger.info('result', JSON.stringify(result));
        return {success: true, message: null, result};
      } catch (error) {
        functions.logger.error('failed to collect calculations from firestore, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the calculations info try it again later',
          result: [],
        };
      }
    });

const getCalculationsDrafts = async () => {
  const calculations = await firestore.collection('calculations')
      .get()
      .then((calculationInfo) => calculationInfo.docs.map((doc) => doc.data()));
  const drafts = calculations.filter((value) => value.isDraft);
  const result = [...drafts];
  for (const calculation of calculations) {
    if (drafts.find((value) => value.calculationType === calculation.calculationType)) {
      continue;
    }
    result.push(calculation);
  }
  return result;
};

const getCalculationsPublished = async () => {
  return firestore.collection('calculations')
      .where('isDraft', '==', false)
      .get()
      .then((calculationInfo) => calculationInfo.docs.map((doc) => doc.data()));
};
