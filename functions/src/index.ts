import {getAppInfoOnStartup} from './functions/getAppInfoOnStartup';
import {getAppInfoOnStartupReady} from './functions/getAppInfoOnStartupReady';
import {triggerFunctionsCron} from './functions/triggerFunctionsCron';

exports.appApi = {getAppInfoOnStartup, getAppInfoOnStartupReady, triggerFunctionsCron};
