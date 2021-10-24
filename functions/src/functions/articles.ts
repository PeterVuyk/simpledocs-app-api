import * as functions from 'firebase-functions';
import {appVersions} from '../appVersions';
import {firestore} from '../FirebaseAdmin';

//  TODO: later change minWidth depending on the environment, also read:
//  https://firebase.google.com/docs/functions/manage-functions#min-max-instances

export const getArticles = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getArticles called but user not authenticated');
        return {success: false, message: 'Authentication required', result: []};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getArticles called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: []};
      }
      if (!('bookType' in data) || !data.bookType) {
        functions.logger.info('Function getArticles called without bookType');
        return {success: false, message: 'Missing bookType or provided bookType not supported', result: []};
      }
      let isProduction = true;
      if ('environment' in data) {
        isProduction = !['staging'].includes(data.environment);
      }

      functions.logger.info(
          'getArticles request for bookType ' + data.bookType +
      ' and env ' + data.environment + ' received for version: ' + data.appVersion,
          {structuredData: true}
      );

      try {
        const result = isProduction ? await getArticlesPublished(data.bookType) : await getArticlesDraft(data.bookType);
        functions.logger.info('result', JSON.stringify(result));
        return {success: true, message: null, result};
      } catch (error) {
        functions.logger.error('failed to collect articles from firestore, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the articles info try it again later',
          result: [],
        };
      }
    });

const getArticlesDraft = async (bookType: string) => {
  const articles = await firestore.collection('books').doc(bookType.trim()).collection(bookType.trim())
      .get()
      .then((article) => article.docs.map((doc) => doc.data()));
  return articles.filter((value) => {
    if (!('markedForDeletion' in value)) {
      return true;
    }
    return value.markedForDeletion !== true;
  });
};

const getArticlesPublished = async (bookType: string) => {
  return firestore.collection('books').doc(bookType.trim()).collection(bookType.trim())
      .where('isDraft', '==', false)
      .get()
      .then((article) => article.docs.map((doc) => doc.data()));
};
