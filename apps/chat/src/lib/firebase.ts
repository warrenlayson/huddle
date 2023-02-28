import { Firebase } from "@acme/firebase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};
const firebase = new Firebase(firebaseConfig, import.meta.env.DEV);

const app = firebase.app;
const firestore = firebase.firestore;
const storage = firebase.storage;
const auth = firebase.auth;

export { app, auth, firestore, storage };
