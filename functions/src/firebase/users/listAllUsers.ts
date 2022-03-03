import {UserRecord} from 'firebase-functions/lib/providers/auth';
import * as admin from 'firebase-admin';

/*
 * We loop per 1000 users through all the users at a time and call after the same function
 * because this is maximum number of users allowed to be listed at a time.
 * Any value greater than the maximum will throw an argument error.
 */
const listAllUsers = (nextPageToken: string | undefined, list: UserRecord[]): Promise<UserRecord[]> => {
  return admin.auth()
      .listUsers(1000, nextPageToken)
      .then(async (listUsersResult) => {
        list.push(...listUsersResult.users);

        if (listUsersResult.pageToken) {
          await listAllUsers(listUsersResult.pageToken, list);
        }
        return list;
      });
};

export default listAllUsers;
