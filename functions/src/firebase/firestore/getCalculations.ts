import {firestore} from '../FirebaseAdmin';

const getCalculations = async (isProduction: boolean) => {
  const result = isProduction ? await getCalculationsPublished() : await getCalculationsDrafts();
  return {result, aggregate: 'calculations'};
};

const getCalculationsDrafts = async () => {
  const calculations = await firestore.collection('calculations')
      .get()
      .then((calculationInfo) => calculationInfo.docs.map((doc) => doc.data()));
  const drafts = calculations.filter((value) => value.isDraft);
  const result = [...drafts];
  for (const calculation of calculations) {
    if (drafts.find((value) => value.calculationType === calculation.calculationType)) {
      continue;
    }
    result.push(calculation);
  }
  return result;
};

const getCalculationsPublished = async () => {
  return firestore.collection('calculations')
      .where('isDraft', '==', false)
      .get()
      .then((calculationInfo) => calculationInfo.docs.map((doc) => doc.data()));
};

export default getCalculations;
