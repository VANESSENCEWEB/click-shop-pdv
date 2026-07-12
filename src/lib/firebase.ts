import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvRUu1jyOMs3d8y1bse8MlgqoVWruihfw",
  authDomain: "click-shop-pdv.firebaseapp.com",
  projectId: "click-shop-pdv",
  storageBucket: "click-shop-pdv.firebasestorage.app",
  messagingSenderId: "853617048856",
  appId: "1:853617048856:web:53515eefc701e339f9326d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;