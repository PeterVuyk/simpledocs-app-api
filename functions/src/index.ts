import {getAppInfoOnStartup} from './functions/getAppInfoOnStartup';
import {getAppInfoOnStartupReady} from './functions/getAppInfoOnStartupReady';
import {triggerFunctionsCron} from './functions/triggerFunctionsCron';
import {toggleNotifications} from './functions/toggleNotifications';
import {enableDisabledNotificationsFromSleep} from './functions/enableDisabledNotificationsFromSleep';

exports.appApi = {
  getAppInfoOnStartup,
  getAppInfoOnStartupReady,
  triggerFunctionsCron,
  toggleNotifications,
  enableDisabledNotificationsFromSleep,
};
