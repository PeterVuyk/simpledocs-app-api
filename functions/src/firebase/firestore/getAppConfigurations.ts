import {firestore} from '../FirebaseAdmin';

const getAppConfigurations = (isProduction: boolean) => {
  return isProduction ? getConfigurationsPublished() : getConfigurationsDrafts();
};

const getConfigurationsDrafts = async () => {
  const doc = await firestore.collection('configurations').doc('appConfigurationsDraft').get();
  if (doc.exists) {
    const appConfigurations = await getConfigurationsPublished();
    return {...doc.data(), versioning: appConfigurations!.versioning};
  }
  return getConfigurationsPublished();
};

const getConfigurationsPublished = async () => {
  return firestore.collection('configurations')
      .doc('appConfigurations')
      .get()
      .then((configurations) => configurations.data());
};

export default getAppConfigurations;
