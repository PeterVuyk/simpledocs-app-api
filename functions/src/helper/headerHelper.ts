const getVersionFromHeaderAccept = (accept: string): string => {
  const keyValueApiVersion = accept.split(';').find((value) => value.includes('api-version'));
  if (!keyValueApiVersion) {
    return '';
  }
  return keyValueApiVersion.split('=')[1].trim();
};

const headerHelper = {
  getVersionFromHeaderAccept,
};

export default headerHelper;
