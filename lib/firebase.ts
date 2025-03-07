import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyCLJj9UoOgqPNqj_8YFckndTtWOS1qxG8I",
  authDomain: "constscannext.firebaseapp.com",
  projectId: "constscannext",
  storageBucket: "constscannext.firebasestorage.app",
  messagingSenderId: "31201344177",
  appId: "1:31201344177:web:ca3498a28cd40255a68090",
  measurementId: "G-GPG5Q4EEF9",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics (only on client side)
let analytics = null
if (typeof window !== "undefined") {
  // Only initialize analytics on the client side
  analytics = getAnalytics(app)
}


export { app, auth, db, storage, analytics }