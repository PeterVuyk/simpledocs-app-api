import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';
import headerHelper from '../helper/headerHelper';

interface Versioning {
  version: string;
  aggregate: string;
}

export const getVersioning = functions
    .region('europe-west3')
    .https.onRequest((request, response) => {
      const version = headerHelper.getVersionFromHeaderAccept(request.get('Accept') as string);
      functions.logger.info(
          'getVersioning request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response
            .status(406)
            .send({success: false, message: 'Missing version or provided version not supported', result: []});
        return;
      }

      db.collection('versioning')
          .get()
          .then((query) =>
            query.docs
                .map((document) => document.data() as Versioning)
                .filter((version) => version.aggregate !== 'cmsConfigurations')
          ).then(
              (versioning) =>
                response.send({success: true, message: null, result: versioning})
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect versioning from firestore, reason: ' + reason);
                response.status(500).send(
                    {success: false, message: 'Failed to collect the versioning info try it again later', result: []}
                );
              }
          );
    });
