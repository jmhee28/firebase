const config = {
  apiKey: "AIzaSyBekQf8uIAECFzJw3Znwh-9AkjfyKOmY5E",
  authDomain: "myboard-39eda.firebaseapp.com",
  projectId: "myboard-39eda",
  storageBucket: "myboard-39eda.appspot.com",
  messagingSenderId: "927528540841",
  appId: "1:927528540841:web:c786b63d92d1c0d6c327b8"
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.' + '\n' +
    'Add your web app\'s configuration object to firebase-config.js');
  } else {
    return config;
  }
}