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
        // For server-side rendering, return placeholders.
        // This avoids trying to initialize Firebase on the server.
        const mockApp = { name: 'mock', options: {}, automaticDataCollectionEnabled: false };
        const mockAuth = { app: mockApp } as unknown as Auth;
        const mockFirestore = { app: mockApp } as unknown as Firestore;
        const mockStorage = { app: mockApp } as unknown as FirebaseStorage;
        return { firebaseApp: mockApp as FirebaseApp, auth: mockAuth, firestore: mockFirestore, storage: mockStorage };
    }

    if (!firebaseApp) {
        const services = initializeServices();
        firebaseApp = services.firebaseApp;
        auth = services.auth;
        firestore = services.firestore;
        storage = services.storage;
        // This is a client-side only operation
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error("Error setting auth persistence:", error);
        });
    }
    return { firebaseApp, auth, firestore, storage };
}

const services = getFirebaseServices();
firebaseApp = services.firebaseApp!;
auth = services.auth!;
firestore = services.firestore!;
storage = services.storage!;


export { firebaseApp, auth, firestore, storage };
