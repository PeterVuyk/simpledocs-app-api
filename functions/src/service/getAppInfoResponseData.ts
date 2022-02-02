import {AppInfoRequest} from '../model/AppInfoRequest';
import getAppConfigurations from '../firebase/firestore/getAppConfigurations';
import {UPDATE_ON_STARTUP, UpdateMoment} from '../model/UpdateMoment';
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

  // Check if a new version is available for the given aggregate.
  let aggregatesToBeUpdated = Object
      .keys(appConfigurations.versioning)
      .filter((aggregate) =>
            appConfigurations.versioning[aggregate]?.version !== request?.versioning?.[aggregate]?.version)
      .filter((aggregate) =>
            appConfigurations.versioning[aggregate]?.updateMoment === updateMoment)
      .map((aggregate) => {
        return {aggregate, isBookType: appConfigurations.versioning[aggregate]?.isBookType};
      });

  // If the aggregate is marked to be updated after startup, but the user doesn't
  // have the aggregate on his phone yet then it need to be added on startup.
  if (updateMoment === UPDATE_ON_STARTUP) {
    const missingAggregatesInApp = Object.keys(appConfigurations.versioning)
        .filter((aggregate) => !Object.keys(request?.versioning ?? {}).includes(aggregate))
        .map((aggregate) => ({aggregate, isBookType: appConfigurations.versioning[aggregate]?.isBookType}));
    aggregatesToBeUpdated = [...aggregatesToBeUpdated, ...missingAggregatesInApp];
  }

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
