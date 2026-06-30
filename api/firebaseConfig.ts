import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 使用您提供的 Firebase 專案設定金鑰
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA186FMM6Pdcft00xfRsF7Bsjg_RccsCnk",
  authDomain: "finalrnprj.firebaseapp.com",
  projectId: "finalrnprj",
  storageBucket: "finalrnprj.firebasestorage.app",
  messagingSenderId: "431314834281",
  appId: "1:431314834281:web:b363ca9d6719e7ccf4e3f8"
};

// 初始化 Firebase
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
