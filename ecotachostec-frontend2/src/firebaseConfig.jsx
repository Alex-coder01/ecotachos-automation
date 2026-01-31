// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyByg5iu5re0cq26Ec5nR5vLwn5O2uwR_Gw",
  authDomain: "ecotachostec.firebaseapp.com",
  projectId: "ecotachostec",
  storageBucket: "ecotachostec.firebasestorage.app",
  messagingSenderId: "754982082654",
  appId: "1:754982082654:web:35e0b235fa0b26ade9fccf",
  measurementId: "G-JB3G8XX01G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Sugerir selección de cuenta para evitar sesiones persistentes indeseadas
googleProvider.setCustomParameters({ prompt: 'select_account' });