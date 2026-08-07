import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewai-9aec5.firebaseapp.com",
  projectId: "interviewai-9aec5",
  storageBucket: "interviewai-9aec5.firebasestorage.app",
  messagingSenderId: "792200875915",
  appId: "1:792200875915:web:8bb151c26bc832453aa98e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
