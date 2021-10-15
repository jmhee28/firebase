const config = {
  /* TODO: ADD YOUR FIREBASE CONFIGURATION OBJECT HERE */
  apiKey: "AIzaSyAkCjtkQBXGcceZBu9wqdWFFAySOEvDpv0",
  authDomain: "myboard-f48e8.firebaseapp.com",
  projectId: "myboard-f48e8",
  storageBucket: "myboard-f48e8.appspot.com",
  messagingSenderId: "178670208957",
  appId: "1:178670208957:web:430a574d0c2f341e9d74d4"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}