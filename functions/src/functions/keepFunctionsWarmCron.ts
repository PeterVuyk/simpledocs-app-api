import * as functions from 'firebase-functions';
import {appVersions} from '../appVersions';
import axios from 'axios';

interface ApiResponse {
  success: boolean;
  result: never;
  message: string | null;
}

export const keepFunctionsWarmCron = functions
    .region('europe-west3')
    .pubsub.schedule('every minute')
    .onRun(async () => {
      for (const url of getUrls()) {
        axios.get(url.toString(), {headers: {Accept: `application/json;api-version=${latestVersion}`}})
            .then((response) => response.data)
            .then((apiResponse: ApiResponse) => {
              const message = `Warmup function url ${url.toString()} with version ${latestVersion}, isSuccess:
            ${apiResponse.success}, message: ${apiResponse.message}`;
              apiResponse.success ? functions.logger.info(message) : functions.logger.error(message);
            })
            .catch((reason) => functions.logger.error(
                `Failed to warmup function with url ${url.toString()}, reason: ${reason}`)
            );
      }

      functions.logger.info('Cron finished');
    });

const latestVersion = appVersions.sort((a, b) => b.localeCompare(a))[0];

const getUrls = (): URL[] => {
  const url = 'https://europe-west3-ambulancezorg-app.cloudfunctions.net/';
  const articlesUrl = new URL('getArticles', url);
  articlesUrl.searchParams.append('bookType', 'bookTypeCron');
  return [
    articlesUrl,
    new URL('getCalculations', url),
    new URL('getConfigurations', url),
    new URL('getDecisionTree', url),
  ];
};
