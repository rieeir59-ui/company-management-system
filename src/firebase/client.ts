'use client';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

function initializeServices() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };
}

function getFirebaseServices() {
    if (typeof window === 'undefined') {
        // For server-side rendering, return placeholders or handle as needed
        return { firebaseApp: null, auth: null, firestore: null, storage: null };
    }

    if (!firebaseApp) {
        const services = initializeServices();
        firebaseApp = services.firebaseApp;
        auth = services.auth;
        firestore = services.firestore;
        storage = services.storage;
        setPersistence(auth, browserLocalPersistence);
    }
    return { firebaseApp, auth, firestore, storage };
}

const services = getFirebaseServices();
firebaseApp = services.firebaseApp!;
auth = services.auth!;
firestore = services.firestore!;
storage = services.storage!;


export { firebaseApp, auth, firestore, storage };
