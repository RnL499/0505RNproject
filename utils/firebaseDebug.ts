/**
 * Firestore 連線診斷與測試工具
 * 用於排查資料庫連線問題
 */

import { addDoc, collection, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

/**
 * 檢查 Firestore 連線狀態
 */
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 開始測試 Firestore 連線...');

    // 測試 1: 嘗試寫入測試文件
    console.log('📝 測試 1: 寫入測試文件');
    const testDocRef = await addDoc(collection(db, 'test'), {
      timestamp: serverTimestamp(),
      message: 'Firestore connection test',
      testTime: new Date().toISOString(),
    });
    console.log('✅ 寫入成功，文檔 ID:', testDocRef.id);

    // 測試 2: 嘗試讀取測試文件
    console.log('📖 測試 2: 讀取測試集合');
    const testCollection = collection(db, 'test');
    const q = query(testCollection, limit(1));
    const querySnapshot = await getDocs(q);
    console.log('✅ 讀取成功，文檔數:', querySnapshot.size);
    querySnapshot.docs.forEach((doc) => {
      console.log('   文檔內容:', doc.data());
    });

    // 測試 3: 檢查 chatRooms 集合
    console.log('📝 測試 3: 檢查 chatRooms 集合');
    const chatRoomsQuery = query(collection(db, 'chatRooms'), limit(5));
    const chatRoomsSnapshot = await getDocs(chatRoomsQuery);
    console.log('✅ chatRooms 集合檢查完成，現有聊天室數:', chatRoomsSnapshot.size);
    chatRoomsSnapshot.docs.forEach((doc, index) => {
      console.log(`   聊天室 ${index + 1}:`, doc.id, doc.data());
    });

    console.log('\n✅ 所有 Firestore 連線測試通過！');
    return {
      success: true,
      message: 'Firestore 連線正常',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    console.error('\n❌ Firestore 連線失敗:', errorMessage);
    console.error('錯誤詳情:', error);

    // 分析常見錯誤
    if (errorMessage.includes('Missing or insufficient permissions')) {
      console.error('\n💡 可能的原因：Firestore 安全規則設定不正確');
      console.error('   請檢查 Firebase Console 的 Firestore Rules');
      console.error('   推薦測試規則：');
      console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
      `);
    } else if (errorMessage.includes('Failed to get document')) {
      console.error('\n💡 可能的原因：網路連線問題或 Firebase 初始化失敗');
    } else if (errorMessage.includes('PERMISSION_DENIED')) {
      console.error('\n💡 可能的原因：使用者未登入或權限不足');
    }

    return {
      success: false,
      message: `Firestore 連線失敗: ${errorMessage}`,
      error: errorMessage,
    };
  }
};

/**
 * 建立測試聊天室
 */
export const createTestChatRoom = async (userId1: string, userId2: string) => {
  try {
    console.log('🔧 建立測試聊天室...');

    const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
      lastMessage: '測試訊息',
      lastMessageTime: serverTimestamp(),
    });

    console.log('✅ 聊天室建立成功，ID:', chatRoomRef.id);

    // 建立測試訊息
    const messageRef = await addDoc(
      collection(db, 'chatRooms', chatRoomRef.id, 'messages'),
      {
        text: '這是測試訊息',
        senderId: userId1,
        senderName: 'Test User',
        createdAt: serverTimestamp(),
      },
    );

    console.log('✅ 測試訊息建立成功，ID:', messageRef.id);

    return {
      success: true,
      chatRoomId: chatRoomRef.id,
      messageId: messageRef.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    console.error('❌ 建立測試聊天室失敗:', errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * 診斷 Firestore 配置
 */
export const diagnosisFirebaseConfig = () => {
  console.log('🔍 Firestore 配置診斷：');
  console.log('Database instance:', db);
  console.log('Database type:', typeof db);
  console.log('Database properties:', Object.keys(db || {}));

  if (!db) {
    console.error('❌ Firestore 實例未初始化！');
    return false;
  }

  console.log('✅ Firestore 實例已初始化');
  return true;
};

export default {
  testFirestoreConnection,
  createTestChatRoom,
  diagnosisFirebaseConfig,
};
