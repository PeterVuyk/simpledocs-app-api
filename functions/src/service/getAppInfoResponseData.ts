import {AppInfoRequest} from '../model/AppInfoRequest';
import getAppConfigurations from '../firebase/firestore/getAppConfigurations';
import {UpdateMoment} from '../model/UpdateMoment';
import getBookPages from '../firebase/firestore/getBookPages';
import getDecisionTree from '../firebase/firestore/getDecisionTree';
import getCalculations from '../firebase/firestore/getCalculations';
import * as functions from 'firebase-functions';

const getAppInfoResponseData = async (request: AppInfoRequest, updateMoment: UpdateMoment) => {
  const isProduction = !['staging'].includes(request.environment);
  const appConfigurations = await getAppConfigurations(isProduction);
  if (appConfigurations?.versioning === null || appConfigurations?.versioning === undefined) {
    throw new Error('Collected appConfigurations, but versioning is empty. Collecting configurations failed');
  }
  const aggregatesToBeUpdated = Object
      .keys(appConfigurations.versioning)
      .filter((aggregate) =>
            appConfigurations.versioning[aggregate]?.version !== request?.versioning?.[aggregate]?.version)
      .filter((aggregate) =>
            appConfigurations.versioning[aggregate]?.updateMoment === updateMoment)
      .map((aggregate) => {
        return {aggregate, isBookType: appConfigurations.versioning[aggregate]?.isBookType};
      });

  const result = await Promise.all(aggregatesToBeUpdated.map(async (value) => {
    if (value.isBookType) {
      return getBookPages(value.aggregate, isProduction);
    }
    if (value.aggregate === 'decisionTree') {
      return getDecisionTree(isProduction);
    }
    if (value.aggregate === 'calculations') {
      return getCalculations(isProduction);
    }
    return Promise.resolve(null);
  }));

  functions.logger.info(
      'The following aggregates will be updated for the calling user: ' +
        result.map((value) => value?.aggregate).join(',')
  );

  const appInfo = result.filter((value) => value !== null).reduce(
      (obj, item) =>
        Object.assign(obj, {
          [item!.aggregate]: item!.result,
        }),
      {}
  );
  return {appConfigurations, ...appInfo};
};

export default getAppInfoResponseData;
