import {firestore} from '../FirebaseAdmin';

const getBookPages = (bookType: string, isProduction: boolean) => {
  return isProduction ? getPublishedPages(bookType) : getDraftPages(bookType);
};

const getDraftPages = async (bookType: string) => {
  const pages = await firestore.collection('books').doc(bookType.trim()).collection(bookType.trim())
      .get()
      .then((page) => page.docs.map((doc) => {
        return {id: doc.id.replace('-draft', ''), ...doc.data()} as any;
      }));
  return pages.filter((value) => {
    if (!('markedForDeletion' in value)) {
      return true;
    }
    return value.markedForDeletion !== true;
  });
};

const getPublishedPages = async (bookType: string) => {
  return firestore.collection('books').doc(bookType.trim()).collection(bookType.trim())
      .where('isDraft', '==', false)
      .get()
      .then((page) => page.docs.map((doc) => {
        return {id: doc.id, ...doc.data()};
      }));
};

export default getBookPages;
