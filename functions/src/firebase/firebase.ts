import firebase from 'firebase';
import 'firebase/functions';
import * as functions from 'firebase-functions';

const firebaseConfig = {
  apiKey: functions.config().api.firebase.api_key,
  authDomain: functions.config().api.firebase.auth_domain,
  projectId: functions.config().api.firebase.project_id,
  storageBucket: functions.config().api.firebase.storage_bucket,
  messagingSenderId: functions.config().api.firebase.messaging_sender_id,
  appId: functions.config().api.firebase.app_id,
  measurementId: functions.config().api.firebase.measurement_id,
};

const Firebase =
  firebase.apps.length === 0 ?
    firebase.initializeApp(firebaseConfig) :
    firebase.app();

export default Firebase;
