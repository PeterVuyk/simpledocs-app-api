import * as functions from 'firebase-functions';
import Firebase from '../firebase/firebase';

export const triggerFunctionsCron = functions
    .region(functions.config().api.firebase_region)
    .pubsub.schedule('every minute')
    .onRun(async () => {
      Firebase.functions(functions.config().api.firebase_region)
          .httpsCallable('appApi-getAppInfo')({
            environment: 'triggerFunctionsCron',
          }).then((value) => value.data)
          .then((data) => functions.logger.info('functions triggered successful', data))
          .catch((reason) => functions.logger.error('functions triggered failed, reason: ' + reason));
    });
