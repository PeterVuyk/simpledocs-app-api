import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';
import headerHelper from '../helper/headerHelper';

export const getConfigurations = functions
    .region('europe-west3')
    .https.onRequest((request, response) => {
      const version = headerHelper.getVersionFromHeaderAccept(request.get('Accept') as string);
      functions.logger.info(
          'getConfigurations request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response
            .status(406)
            .send({success: false, message: 'Missing version or provided version not supported', result: null});
        return;
      }

      db.collection('configurations')
          .doc('appConfigurations')
          .get()
          .then(
              (configurations) =>
                response.send({success: true, message: null, result: configurations.data()})
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect versioning from firestore, reason: ' + reason);
                response.status(500).send(
                    {
                      success: false,
                      message: 'Failed to collect the configurations info try it again later',
                      result: null,
                    }
                );
              }
          );
    });
