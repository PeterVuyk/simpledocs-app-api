import * as functions from 'firebase-functions';
import appInfoRequestValidator from '../validators/AppInfoRequestValidator';
import getCalculations from '../firebase/firestore/getCalculations';
import getAppConfigurations from '../firebase/firestore/getAppConfigurations';
import getDecisionTree from '../firebase/firestore/getDecisionTree';
import getBookPages from '../firebase/firestore/getBookPages';
import {AppInfoRequest} from '../model/AppInfoRequest';

//  TODO: later change runWith depending on the environment, also read:
//  https://firebase.google.com/docs/functions/manage-functions#min-max-instances

export const getAppInfo = functions
    .runWith({minInstances: functions.config().api.app_info_min_instances})
    .region(functions.config().api.firebase_region)
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        if (data.environment === 'triggerFunctionsCron') {
          functions.logger.info('Function triggered to keep it warm');
          return {success: true, message: 'Function triggered to keep it warm', result: null};
        }
        functions.logger.info('Function getConfigurations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      functions.logger.info('validationResult', JSON.stringify(data));
      const validationResult = appInfoRequestValidator(data);
      if (validationResult !== '') {
        functions.logger.info('Function getConfigurations called but request validation failed: ' + validationResult);
        return {success: false, message: 'request validation failed', result: null};
      }

      try {
        const getResponse = await getResponseData(data as AppInfoRequest);
        functions.logger.info('getAppInfo called successfully');
        return {success: true, message: null, result: getResponse};
      } catch (error) {
        functions.logger.error('failed to collect AppInfo, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the appInfo try it again later',
          result: {},
        };
      }
    });

const getResponseData = async (request: AppInfoRequest) => {
  const isProduction = !['staging'].includes(request.environment);
  const appConfigurations = await getAppConfigurations(isProduction);
  if (appConfigurations?.versioning === null || appConfigurations?.versioning === undefined) {
    throw new Error('Collected appConfigurations, but versioning is empty. Collecting configurations failed');
  }
  const aggregatesToBeUpdated = Object
      .keys(appConfigurations.versioning)
      .filter((aggregate) =>
          appConfigurations.versioning[aggregate]?.version !== request?.versioning?.[aggregate]?.version)
      .map((aggregate) => {
        return {aggregate, isBookType: appConfigurations.versioning[aggregate]?.isBookType};
      });

  const result = await Promise.all(aggregatesToBeUpdated.map(async (value) => {
    if (value.isBookType) {
      return getBookPages(value.aggregate, isProduction);
    }
    if (value.aggregate === 'decisionTree') {
      return getDecisionTree(isProduction);
    }
    if (value.aggregate === 'calculations') {
      return getCalculations(isProduction);
    }
    return Promise.resolve(null);
  }));

  functions.logger.info(
      'The following aggregates will be updated for the calling user: ' +
      result.map((value) => value?.aggregate).join(',')
  );

  const appInfo = result.filter((value) => value !== null).reduce(
      (obj, item) =>
        Object.assign(obj, {
          [item!.aggregate]: item!.result,
        }),
      {}
  );
  return {appConfigurations, ...appInfo};
};
