import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import omit from '../util/omit';

export const enableDisabledNotificationsFromSleep = functions
    .runWith({minInstances: 0})
    .region(functions.config().api.firebase_region)
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        return {
          success: false,
          message: 'The authentication for the user is missing, could not enable disabled notifications from sleep',
          result: null,
        };
      }
      return admin.auth().getUser(context.auth?.uid)
          .then((value) => {
            const customClaims = omit(value.customClaims, ['appNotificationsDisabled']);
            admin.auth().setCustomUserClaims(value.uid, customClaims);
          }
          )
          .then(() => ({success: true, message: null, result: null}))
          .catch((reason) => {
            functions.logger.error('Failed removing appNotificationsDisabled from customClaims, reason: ' + reason);
            return {success: 'Failed removing appNotificationsDisabled from customClaims', message: null, result: null};
          });
    });
