import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';

export const getDecisionTree = functions
    .region('europe-west1')
    .https.onRequest((request, response) => {
      const version = request.headers.api_version as string;
      functions.logger.info(
          'getDecisionTree request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response.status(406).send('{"success": false, "message": "Missing version or provided version not supported"}');
        return;
      }

      db.collection('decisionTree')
          .where('isDraft', '==', false)
          .get()
          .then(
              (decisionTree) => response.send(
                  decisionTree.docs.map((doc) => doc.data())
              )
          )
          .catch(
              (reason) =>
                functions.logger.error('failed to collect decisionTree from firestore, reason: ' + reason)
          )
          .then(() => response.status(500).send(
              '{"success": false, "message": "Failed to collect the decisionTree info try it again later"}')
          );
    });