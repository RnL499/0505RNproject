/**
 * Firebase 專案設定
 * 請到 Firebase Console 建立專案後，將下方值替換為你的設定。
 * https://console.firebase.google.com/
 */
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export const isFirebaseConfigured = (): boolean =>
  !firebaseConfig.apiKey.includes('YOUR_');
