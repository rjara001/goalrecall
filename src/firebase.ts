import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  connectAuthEmulator,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDocFromServer,
  Firestore,
} from "firebase/firestore";
import firebaseAppletConfig from "../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.firestoreDatabaseId
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== "undefined") {
  try {
    if (isFirebaseConfigured()) {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      db = firebaseConfig.firestoreDatabaseId
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
      auth = getAuth(app);

      const useEmulator =
        typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_EMULATOR === "true";

      if (useEmulator) {
        const authHost = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_HOST;
        const authPort = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_PORT;
        if (authHost && authPort) {
          connectAuthEmulator(auth, `http://${authHost}:${authPort}`);
        }
        const fsHost = import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_HOST;
        const fsPort = Number(import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_PORT);
        if (fsHost && Number.isFinite(fsPort)) {
          connectFirestoreEmulator(db, fsHost, fsPort);
        }
      }

      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: "select_account",
      });
    } else {
      console.warn(
        "[Firebase] Configuration missing or incomplete in firebase-applet-config.json."
      );
    }
  } catch (err) {
    console.error("[Firebase] Initialization failed:", err);
  }
}

let connectionTested = false;

export async function testConnection(): Promise<void> {
  if (typeof window === "undefined" || !db || connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  firebaseSignOut,
  firebaseSignOut as signOut,
};
