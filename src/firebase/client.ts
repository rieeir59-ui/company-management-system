'use client';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: any;

// Initialize Firebase on the client side
if (typeof window !== 'undefined' && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence); // Persist user session
  firestore = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

  // If you want to use the local emulators, uncomment the following lines
  // if (process.env.NODE_ENV === 'development') {
  //   connectAuthEmulator(auth, "http://localhost:9099");
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  //   connectStorageEmulator(storage, "localhost", 9199);
  // }

} else if (typeof window !== 'undefined' && getApps().length > 0) {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
}


export { firebaseApp, auth, firestore, storage };
