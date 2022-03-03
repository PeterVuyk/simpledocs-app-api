import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import listAllUsers from '../firebase/users/listAllUsers';
import deleteUserByUid from '../firebase/users/deleteUserByUid';

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
      if (data.expoPushToken !== null && context.auth?.uid) {
        removeDuplicateUserAccounts(context.auth?.uid, data.expoPushToken)
            .catch((reason) => functions.logger.error(
                'Tried to remove possible duplicate accounts that contains the same expoPushToken but failed', reason));
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

// If a user removes and reinstall the app, there are 2 user accounts. If we toggle on the notifications while
// another account already exists then we have 2 tokens. When sending the notification we already filter
// duplicate tokens, but the problem is there when the user want to disable notifications. Then he keep on
// receiving notifications because the token exists in a previous account. For this reason we need to remove
// the oldest account with the token.
const removeDuplicateUserAccounts = (userId: string, expoPushToken: string) => {
  return listAllUsers(undefined, [])
      .then((users) =>
        users.filter((user) => user.customClaims?.expoPushToken === expoPushToken).filter((user) => user.uid !== userId)
      ).then((users) => users.forEach((user) => {
        return deleteUserByUid(user.uid);
      }));
};
