import {firestore} from '../FirebaseAdmin';
import omit from '../../util/omit';

const getStandalonePages = async (isProduction: boolean) => {
  let result = isProduction ? await getStandalonePagesPublished() : await getStandalonePagesDrafts();
  result = result.map((value) => omit(value, ['isDraft', 'markedForDeletion']));
  return {result, aggregate: 'standalonePages'};
};

const getStandalonePagesDrafts = async () => {
  const standalonePages = await firestore.collection('standalonePages')
      .get()
      .then((pages) => pages.docs.map((doc) => doc.data()));
  const drafts = standalonePages.filter((value) => value.isDraft);
  const result = [...drafts];
  for (const page of standalonePages) {
    if (drafts.find((value) => value.standalonePageType === page.standalonePageType)) {
      continue;
    }
    result.push(page);
  }
  return result;
};

const getStandalonePagesPublished = async () => {
  return firestore.collection('standalonePages')
      .where('isDraft', '==', false)
      .get()
      .then((pages) => pages.docs.map((doc) => doc.data()));
};

export default getStandalonePages;
