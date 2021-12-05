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
  let result;
  result = {appConfigurations: appConfigurations};
  if (appConfigurations?.versioning === null || appConfigurations?.versioning === undefined) {
    throw new Error('Collected appConfigurations, but versioning is empty. Collecting configurations failed');
  }
  for (const aggregate of Object.keys(appConfigurations.versioning)) {
    const versionInfo = appConfigurations.versioning[aggregate];
    if (
      request?.versioning !== null &&
      request?.versioning !== undefined &&
      request?.versioning[aggregate] !== undefined &&
      request?.versioning[aggregate].version === versionInfo.version
    ) {
      continue;
    }
    if (versionInfo.isBookType) {
      result = {...result, [aggregate]: await getBookPages(aggregate, isProduction)};
      continue;
    }
    if (aggregate === 'decisionTree') {
      result = {...result, [aggregate]: await getDecisionTree(isProduction)};
      continue;
    }
    if (aggregate === 'calculations') {
      result = {...result, [aggregate]: await getCalculations(isProduction)};
    }
  }
  return result;
};
