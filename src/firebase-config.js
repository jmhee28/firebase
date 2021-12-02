const config = {
   apiKey: "AIzaSyD7EWtLvac8ru5qS2vRFRlShCnygJ47bwY",
  authDomain: "myboard-995d2.firebaseapp.com",
  projectId: "myboard-995d2",
  databaseURL: "https://myboard-995d2-default-rtdb.firebaseio.com",
  storageBucket: "myboard-995d2.appspot.com",
  messagingSenderId: "761366581601",
  appId: "1:761366581601:web:3b2a869b661a6086eb7520"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}