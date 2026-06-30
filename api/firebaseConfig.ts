import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA186FMM6Pdcft00xfRsF7Bsjg_RccsCnk",
  authDomain: "finalrnprj.firebaseapp.com",
  databaseURL: "https://finalrnprj-default-rtdb.firebaseio.com",
  projectId: "finalrnprj",
  storageBucket: "finalrnprj.firebasestorage.app",
  messagingSenderId: "431314834281",
  appId: "1:431314834281:web:b363ca9d6719e7ccf4e3f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 初始化 Firebase Auth
export const auth = getAuth(app);

// 初始化 Firestore
export const db = getFirestore(app);

if (!db) {
  console.error('❌ Firestore 初始化失敗');
} else {
  console.log('✅ Firebase 與 Firestore 已成功初始化');
}
