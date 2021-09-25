import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';

export const getConfigurations = functions
    .region('europe-west1')
    .https.onRequest((request, response) => {
      const version = request.headers.api_version as string;
      functions.logger.info(
          'getConfigurations request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response.status(406).send('Missing version or provided version not supported');
        return;
      }

      db.collection('configurations')
          .doc('appConfig')
          .get()
          .then(
              (configurations) =>
                response.send(configurations.data())
          )
          .catch(
              (reason) =>
                functions.logger.error('failed to collect versioning from firestore, reason: ' + reason)
          )
          .then(() => response.status(500).send(
              '{"success": false, "message": "Failed to collect the configurations info try it again later"}')
          );
    });
