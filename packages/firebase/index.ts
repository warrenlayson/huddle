import { FirebaseApp, initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

export class Firebase {
  public auth: Auth;
  public firestore: Firestore;
  public storage: FirebaseStorage;
  public app: FirebaseApp;

  constructor(config: FirebaseOptions, isDev: boolean) {
    this.app = initializeApp(config);

    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    this.storage = getStorage(this.app);

    if (isDev) {
      connectAuthEmulator(this.auth, "http://192.168.1.224:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(this.firestore, "192.168.1.224", 8080);
      connectStorageEmulator(this.storage, "192.168.1.224", 9199);
    }
  }
}
