import {firestore} from '../FirebaseAdmin';
import omit from '../../util/omit';

const getAppConfigurations = (isProduction: boolean) => {
  return isProduction ? getConfigurationsPublished() : getConfigurationsDrafts();
};

const getConfigurationsDrafts = async () => {
  const appConfigurations = await firestore.collection('configurations')
      .doc('appConfigurations')
      .get()
      .then((value) => value.data());
  const appConfigurationsDraft = await firestore.collection('configurations')
      .doc('appConfigurationsDraft')
      .get()
      .then((value) => value.data());
  if (appConfigurations === undefined) {
    return appConfigurations;
  }
  const configurations = appConfigurationsDraft ?
      appConfigurationsDraft :
      appConfigurations;
  return {...configurations, versioning: appConfigurations.versioning};
};

const getConfigurationsPublished = async () => {
  const configurations = await firestore.collection('configurations')
      .doc('appConfigurations')
      .get()
      .then((configurations) => configurations.data());
  if (configurations === undefined) {
    return configurations;
  }
  for (const [aggregate, versionInfo] of Object.entries(configurations.versioning)) {
    // @ts-ignore
    if (versionInfo.isDraft) {
      configurations.versioning = omit(configurations.versioning, [aggregate]);
      configurations.firstBookTab.bookTypes =
          configurations.firstBookTab.bookTypes.filter((value: { bookType: string; }) => value.bookType !== aggregate);
      configurations.secondBookTab.bookTypes =
          configurations.secondBookTab.bookTypes.filter((value: { bookType: string; }) => value.bookType !== aggregate);
    }
  }
  return configurations;
};

export default getAppConfigurations;
