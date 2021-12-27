import {firestore} from '../FirebaseAdmin';

const getDecisionTree = async (isProduction: boolean) => {
  const result = isProduction ? await getDecisionTreePublished() : await getDecisionTreeDrafts();
  return {result, aggregate: 'decisionTree'};
};

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

export default getDecisionTree;
