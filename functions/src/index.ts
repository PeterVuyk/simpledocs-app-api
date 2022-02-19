import {getAppInfoOnStartup} from './functions/getAppInfoOnStartup';
import {getAppInfoOnStartupReady} from './functions/getAppInfoOnStartupReady';
import {triggerFunctionsCron} from './functions/triggerFunctionsCron';
import {toggleNotifications} from './functions/toggleNotifications';

exports.appApi = {getAppInfoOnStartup, getAppInfoOnStartupReady, triggerFunctionsCron, toggleNotifications};
