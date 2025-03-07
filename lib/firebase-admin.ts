import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

interface FirebaseAdminApp {
  app: App;
  auth: ReturnType<typeof getAuth>;
  firestore: ReturnType<typeof getFirestore>;
  storage: ReturnType<typeof getStorage>;
}

export function initFirebaseAdminApp(): FirebaseAdminApp {
  const apps = getApps();
  if (apps.length > 0) {
    const app = apps[0];
    return {
      app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are missing. Please check your environment variables.");
  }

  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Correct placement
  });

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}
