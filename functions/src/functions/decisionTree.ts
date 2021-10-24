import * as functions from 'firebase-functions';
import {firestore} from '../FirebaseAdmin';
import {appVersions} from '../appVersions';

export const getDecisionTree = functions
    .runWith({minInstances: 1})
    .region('europe-west3')
    .https.onCall(async (data, context) => {
      if (!context.auth?.uid) {
        functions.logger.info('Function getDecisionTree called but user not authenticated');
        return {success: false, message: 'Authentication required', result: []};
      }
      if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
        functions.logger.info('Function getDecisionTree called without appVersion');
        return {success: false, message: 'Missing appVersion or provided version not supported', result: []};
      }
      let isProduction = true;
      if ('environment' in data) {
        isProduction = !['staging'].includes(data.environment);
      }

      try {
        const result = isProduction ? await getDecisionTreePublished() : await getDecisionTreeDrafts();
        functions.logger.info('result', JSON.stringify(result));
        return {success: true, message: null, result};
      } catch (error) {
        functions.logger.error('failed to collect decisionTree from firestore, reason: ' + error);
        return {
          success: false,
          message: 'Failed to collect the decisionTree info try it again later',
          result: [],
        };
      }
    });

const getDecisionTreeDrafts = async () => {
  let steps = await firestore.collection('decisionTree')
      .get()
      .then((decisionTree) => decisionTree.docs.map((doc) => doc.data()));
  steps = steps.filter((value) => {
    if (!('markedForDeletion' in value)) {
      return true;
    }
    return value.markedForDeletion !== true;
  });
  const artifacts = await firestore.collection('artifacts').get().then((value) => value.docs.map((doc) => {
    return {id: doc.id, ...doc.data()};
  }));
  steps.forEach((step) => {
    if (!('contentId' in step) || !step.contentId) {
      return;
    }
    if ('content' in step && step.content !== undefined) {
      return;
    }
    const artifact = artifacts.find((artifact) => artifact.id === step.contentId);
    // @ts-ignore
    step.content = artifact?.content ?? '';
    // @ts-ignore
    step.contentType = artifact?.contentType ?? '';
  });
  return steps;
};

const getDecisionTreePublished = async () => {
  return firestore.collection('decisionTree')
      .where('isDraft', '==', false)
      .get()
      .then((decisionTree) => decisionTree.docs.map((doc) => doc.data()));
};

