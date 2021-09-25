import * as functions from 'firebase-functions';
import {db} from '../db';
import {appVersions} from '../appVersions';

export const getArticles = functions
    .region('europe-west1')
    .https.onRequest((request, response) => {
      const version = request.headers.api_version as string;
      const bookType = request.query.bookType as string;
      functions.logger.info(
          'getArticles request for bookType ' + bookType + ' received for version: ' + version,
          {structuredData: true}
      );
      if (version === undefined || !appVersions.includes(version)) {
        response.status(406).send({success: false, message: 'Missing version or provided version not supported'});
        return;
      }
      if (!isBookTypeValid(bookType)) {
        response.status(400).send({succes: false, message: 'bookType query string expected but is missing'});
        return;
      }

      db.collection(bookType)
          .where('isDraft', '==', false)
          .get()
          .then((article) =>
            response.send({success: true, message: article.docs.map((doc) => doc.data())}
            )
          )
          .catch(
              (reason) => {
                functions.logger.error('failed to collect articles from firestore, reason: ' + reason);
                response.status(500).send(
                    {success: false, message: 'Failed to collect the articles info try it again later'}
                );
              }
          );
    });

const isBookTypeValid = (bookType: string) => {
  return [
    'instructionManual',
    'ontheffingGoedeTaakuitoefening',
    'brancherichtlijnMedischeHulpverlening',
    'regelingOGS2009',
    'RVV1990',
  ].includes(bookType);
};
