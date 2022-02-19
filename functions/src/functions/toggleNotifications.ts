import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const toggleNotifications = functions
    .runWith({minInstances: 0})
    .region(functions.config().api.firebase_region)
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        return {
          success: false,
          message: 'The authentication for the user is missing, could not toggle notification',
          result: null,
        };
      }
      return admin.auth().getUser(context.auth?.uid)
          .then((value) =>
            admin.auth().setCustomUserClaims(value.uid, {...value.customClaims, expoPushToken: data.expoPushToken})
          )
          .then(() => ({success: true, message: null, result: null}))
          .catch((reason) => {
            functions.logger.error('Failed updating user with notification toggle settings, reason: ' + reason);
            return {success: 'Failed updating user with notification toggle settings', message: null, result: null};
          });
    });
