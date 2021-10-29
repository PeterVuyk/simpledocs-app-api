import {appVersions} from '../appVersions';

const validateVersioning = (data: any, errorMessages: string[]) => {
  if (!('versioning' in data) || data.versioning === null) {
    return errorMessages;
  }
  for (const aggregate of Object.keys(data.versioning)) {
    const versionInfo = data.versioning[aggregate];
    if (!('isBookType' in versionInfo) || typeof versionInfo.isBookType !== 'boolean') {
      errorMessages.push(`Function called but versioning.${aggregate}.isBookType is missing or is not an boolean`);
    }

    if (!('version' in versionInfo)) {
      errorMessages.push(`Function called but versioning.${aggregate}.version is missing`);
    }
  }
  return errorMessages;
};

const createValidationErrorMessage = (errorMessages: string[]): string => {
  return `The request data is validated but is incorrect, the following mistakes are found:\n${errorMessages.join(
      '\n'
  )}`;
};

const appInfoRequestValidator = (data: any) => {
  if (!data) {
    return 'The request data is empty, please provide a valid request.';
  }
  let errorMessages: string[] = [];
  if (!('appVersion' in data) || !appVersions.includes(data.appVersion)) {
    errorMessages.push('Function called but appVersion is missing or is not supported');
  }
  if (!('environment' in data) || !data.environment) {
    errorMessages.push('Function called but environment is missing');
  }
  errorMessages = validateVersioning(data, errorMessages);
  if (errorMessages.length === 0) {
    return '';
  }
  return createValidationErrorMessage(errorMessages);
};

export default appInfoRequestValidator;
