import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';
import headerHelper from '../helper/headerHelper';

export const getCalculations = functions
    .region('europe-west3')
    .https.onRequest((request, response) => {
      const version = headerHelper.getVersionFromHeaderAccept(request.get('Accept') as string);
      functions.logger.info(
          'getCalculations request received for version: ' + version, {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response
            .status(406)
            .send({success: false, message: 'Missing version or provided version not supported', result: []});
        return;
      }

      db.collection('calculations')
          .where('isDraft', '==', false)
          .get()
          .then((calculationInfo) =>
            response.send({success: true, message: null, result: calculationInfo.docs.map((doc) => doc.data())}
            )
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect calculations from firestore, reason: ' + reason);
                response.status(500).send(
                    {success: false, message: 'Failed to collect the calculation info try it again later', result: []}
                );
              }
          );
    });
