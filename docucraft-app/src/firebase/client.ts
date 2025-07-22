import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB7Le1h_Dviu3J18CgnjD1LOzACQwJFBgU",
  authDomain: "docucraft-35bc5.firebaseapp.com",
  projectId: "docucraft-35bc5",
  storageBucket: "docucraft-35bc5.firebasestorage.app",
  messagingSenderId: "1055725540565",
  appId: "1:1055725540565:web:23520f11624f07cf763e5c",
  measurementId: "G-JSQX5F7BE7",
};

export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);