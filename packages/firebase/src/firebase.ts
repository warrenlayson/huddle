import {
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectDatabaseEmulator,
  getDatabase,
  type Database,
} from "firebase/database";
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
  public database: Database;

  constructor(config: FirebaseOptions, isDev: boolean) {
    this.app = initializeApp(config);

    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
    this.storage = getStorage(this.app);
    this.database = getDatabase(this.app);

    if (isDev) {
      connectAuthEmulator(this.auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!this.firestore._settingsFrozen) {
        connectFirestoreEmulator(this.firestore, "localhost", 8080);
      }
      connectStorageEmulator(this.storage, "localhost", 9199);
      connectDatabaseEmulator(this.database, "localhost", 9099);
    }
  }
}
