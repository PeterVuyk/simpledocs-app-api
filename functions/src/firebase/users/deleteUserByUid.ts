import * as admin from 'firebase-admin';

const deleteUserByUid = (uid: string): Promise<void> => {
  return admin.auth().deleteUser(uid);
};

export default deleteUserByUid;
