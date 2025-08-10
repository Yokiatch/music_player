import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase configuration
    apiKey: "AIzaSyAky73q2dj3JtEdGfTCFhXnlxkLBbgwqbw",
  authDomain: "spotify-clone-87686.firebaseapp.com",
  projectId: "spotify-clone-87686",
  storageBucket: "spotify-clone-87686.firebasestorage.app",
  messagingSenderId: "946155014270",
  appId: "1:946155014270:web:5a0314263ad8b8f303b02f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
