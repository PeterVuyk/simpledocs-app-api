import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';

export const getVersioning = functions
    .region('europe-west1')
    .https.onRequest((request, response) => {
      const version = request.headers.api_version as string;
      functions.logger.info(
          'getVersioning request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response.status(406).send({success: false, message: 'Missing version or provided version not supported'});
        return;
      }

      db.collection('versioning')
          .doc('aggregate')
          .get()
          .then(
              (versioning) =>
                response.send({success: true, message: versioning.data()})
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect versioning from firestore, reason: ' + reason);
                response.status(500).send(
                    {success: false, message: 'Failed to collect the versioning info try it again later'}
                );
              }
          );
    });
