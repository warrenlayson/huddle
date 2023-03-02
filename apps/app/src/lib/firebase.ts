import { Firebase } from "@acme/firebase";

import { env } from "../env.mjs";

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_API_KEY,
  authDomain: env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: env.NEXT_PUBLIC_DATABASE_URL,
  projectId: env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_APP_ID,
};
const firebase = new Firebase(firebaseConfig, false);

const app = firebase.app;
const firestore = firebase.firestore;
const storage = firebase.storage;
const auth = firebase.auth;
const database = firebase.database;

export { app, auth, firestore, storage, database };
