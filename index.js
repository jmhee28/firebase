'use strict';

import { initializeApp } from 'firebase/app';
import {
   getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getPerformance } from 'firebase/performance';
import { getFirebaseConfig } from './firebase-config.js';

async function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new GoogleAuthProvider();
  await signInWithPopup(getAuth(), provider);
}

function signOutUser() {
  // Sign out of Firebase.
  signOut(getAuth());
}

// Saves a new message to the Cloud Firestore.
async function saveMessage(messageText) {
  // Add a new message entry to the Firebase database.
  try {
    await addDoc(collection(getFirestore(), 'messages'), {
      name: getUserName(),
      text: messageText,
      profilePicUrl: getProfilePicUrl(),
      timestamp: serverTimestamp()
    });
  }
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
  }
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  // TODO: Complete this function.
  return !!getAuth().currentUser;
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'desc'), limit(12));
  
  // Start listening to the query.
  onSnapshot(recentMessagesQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        displayMessage(change.doc.id, message.timestamp, message.name,
                      message.text, message.profilePicUrl, message.imageUrl);
      }
    });
  });
}
// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  onAuthStateChanged(getAuth(), authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return getAuth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return getAuth().currentUser.displayName;
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function () {
      // Clear message text field and re-enable the SEND button.
      toggleButton();
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    var userName = getUserName();
    // Set the user's profile pic and name.
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.classList.remove('is-hidden');
    signOutButtonElement.classList.remove('is-hidden');

    // Hide sign-in button.
    signInButtonElement.classList.add('is-hidden');

    // Enable text input.
    messageInputElement.removeAttribute('disabled');
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.classList.add('is-hidden');
    signOutButtonElement.classList.add('is-hidden');

    // Show sign-in button.
    signInButtonElement.classList.remove('is-hidden');

    // Disable text input.
    messageInputElement.setAttribute('disabled', true);
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }
  return false;
}

// Template for messages.
var MESSAGE_TEMPLATE =
  '<figure class="media-left">' +
  '<div><p class="image is-64x64"><img class="pic is-rounded"></p></div></figure>' +
  '<div class="media-content"><div class="content">' +
  '<div class="name"></div>' +
  '<p class="text"></p>' +
  '</div></div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// Delete a Message from the UI.
function deleteMessage(id) {
  var article = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (article) {
    article.parentNode.removeChild(article);
  }
  if (messageListElement.childElementCount == 0) {
    noMessageElement.classList.remove('is-hidden');
  }
}

function createAndInsertMessage(id, timestamp) {
  const article = document.createElement('article');
  article.classList.add('media')
  article.innerHTML = MESSAGE_TEMPLATE;
  article.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  article.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(article);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime < timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(article, messageListNode);
  }

  return article;
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, picUrl, imageUrl) {
  noMessageElement.classList.add('is-hidden');

  var article = document.getElementById(id) || createAndInsertMessage(id, timestamp);

  // profile picture
  if (picUrl) {
    var pic = article.querySelector('.pic');
    pic.src = addSizeToGoogleProfilePic(picUrl);
  }

  var ts = timestamp ? timestamp.toDate().toLocaleString() : ""
  article.querySelector('.name').innerHTML = `<strong>${name}</strong> <small>${ts}</small>`;

  var messageElement = article.querySelector('.text');
  messageElement.textContent = text;
  // Replace all line breaks by <br>.
  messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Shortcuts to DOM Elements.
const messageListElement = document.getElementById('messages');
const messageFormElement = document.getElementById('message-form');
const messageInputElement = document.getElementById('message');
const submitButtonElement = document.getElementById('submit');
const imageButtonElement = document.getElementById('submitImage');
const userNameElement = document.getElementById('user-name');
const signInButtonElement = document.getElementById('sign-in');
const signOutButtonElement = document.getElementById('sign-out');
const noMessageElement = document.getElementById('no-message');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Initialize Firebase
const firebaseAppConfig = getFirebaseConfig();
initializeApp(firebaseAppConfig);
initFirebaseAuth();

// We load currently existing chat messages and listen to new ones.
loadMessages();
