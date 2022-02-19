import * as functions from 'firebase-functions';
import appInfoRequestValidator from '../validators/AppInfoRequestValidator';
import {AppInfoRequest} from '../model/AppInfoRequest';
import {UPDATE_ON_STARTUP} from '../model/UpdateMoment';
import getAppInfoResponseData from '../service/getAppInfoResponseData';

//  TODO: later change runWith depending on the environment, also read:
//  https://firebase.google.com/docs/functions/manage-functions#min-max-instances

export const getAppInfoOnStartup = functions
    .runWith({minInstances: functions.config().api.app_info_min_instances})
    .region(functions.config().api.firebase_region)
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        if (data.environment === 'triggerFunctionsCron') {
          functions.logger.info('Function triggered to keep it warm');
          return {success: true, message: 'Function triggered to keep it warm', result: null};
        }
        functions.logger.warn('Function getConfigurations called but user not authenticated');
        return {success: false, message: 'Authentication required', result: null};
      }
      const validationResult = appInfoRequestValidator(data);
      if (validationResult !== '') {
        functions.logger.error('Function getConfigurations called but request validation failed: ' + validationResult);
        return {success: false, message: 'request validation failed', result: null};
      }

      try {
        const getResponse = await getAppInfoResponseData(data as AppInfoRequest, UPDATE_ON_STARTUP);
        functions.logger.info('getAppInfo called successfully');
        return {success: true, message: null, result: getResponse};
      } catch (error) {
        functions.logger.error('failed to collect AppInfo onStartup, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the appInfo onStartup try it again later',
          result: {},
        };
      }
    });
