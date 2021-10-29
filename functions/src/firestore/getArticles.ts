import {firestore} from '../FirebaseAdmin';

const getArticles = (bookType: string, isProduction: boolean) => {
  return isProduction ? getArticlesPublished(bookType) : getArticlesDraft(bookType);
};

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

export default getArticles;
