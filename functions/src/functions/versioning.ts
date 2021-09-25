import * as functions from 'firebase-functions';
import {db} from '../db';

export const getVersioning = functions
    .region('europe-west1')
    .https.onRequest((request, response) => {
      const version = request.headers.api_version;
      functions.logger.info(
          'getVersioning request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || version !== '1.0.0') {
        response.status(406).send('Missing version or provided version not supported');
        return;
      }
      db.collection('versioning')
          .doc('aggregate')
          .get()
          .then(
              (versioning) =>
                response.send(`{"success": true, "data": ${JSON.stringify(versioning.data())}}`)
          )
          .catch(
              (reason) =>
                functions.logger.error('failed to collect versioning from firestore, reason: ' + reason)
          )
          .then(() => response.status(500).send(
              '{"success": false, "message": "Failed to collect the versioning info try it again later"}')
          );
    });
