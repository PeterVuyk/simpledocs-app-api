import * as functions from 'firebase-functions';
import Firebase from '../firebase/firebase';

export const triggerFunctionsCron = functions
    .region(functions.config().api.firebase_region)
    .pubsub.schedule('every minute')
    .onRun(async () => {
      Firebase.functions(functions.config().api.firebase_region)
          .httpsCallable('appApi-getAppInfoOnStartup')({
            environment: 'triggerFunctionsCron',
          }).then((value) => value.data)
          .then((data) => functions.logger.info('Cron triggered appApi-getAppInfoOnStartup successful', data))
          .catch((reason) =>
            functions.logger.error('cron triggered appApi-getAppInfoOnStartup failed, reason: ' + reason));
      Firebase.functions(functions.config().api.firebase_region)
          .httpsCallable('appApi-getAppInfoOnStartupReady')({
            environment: 'triggerFunctionsCron',
          }).then((value) => value.data)
          .then((data) => functions.logger.info('Cron triggered appApi-getAppInfoOnStartupReady successful', data))
          .catch((reason) =>
            functions.logger.error('Cron trigger appApi-getAppInfoOnStartupReady failed, reason: ' + reason));
    });
