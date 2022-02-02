import * as functions from 'firebase-functions';
import appInfoRequestValidator from '../validators/AppInfoRequestValidator';
import {AppInfoRequest} from '../model/AppInfoRequest';
import {UPDATE_ON_STARTUP_READY} from '../model/UpdateMoment';
import getAppInfoResponseData from '../service/getAppInfoResponseData';

export const getAppInfoOnStartupReady = functions
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
        const getResponse = await getAppInfoResponseData(data as AppInfoRequest, UPDATE_ON_STARTUP_READY);
        functions.logger.info('getAppInfo called successfully');
        return {success: true, message: null, result: getResponse};
      } catch (error) {
        functions.logger.error('failed to collect AppInfo onStartupReady, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the appInfo onStartupReady try it again later',
          result: {},
        };
      }
    });
