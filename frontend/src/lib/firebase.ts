import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmWuswPAOSSqXlrCP8mzviJbvFBD6jF4A",
  authDomain: "btechpaperanalysis.firebaseapp.com",
  projectId: "btechpaperanalysis",
  // ... other keys
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();