# 快速開始指南 - Facebook Messenger 風格聊天應用

## 📱 應用概述

這是一個使用 **React Native (Expo)** + **React Navigation** 開發的簡易 Facebook Messenger 風格聊天應用。

## 🚀 快速開始

### 1. 安裝依賴
```bash
cd RNprjs
npm install
```

### 2. 運行應用
```bash
# 啟動 Expo 開發服務器
npm start

# Android 設備/模擬器
npm run android

# iOS 模擬器
npm run ios

# Web 瀏覽器
npm run web
```

## 📂 項目文件結構

```
RNprjs/
├── data/
│   └── chatData.json              ← 聊天虛擬數據
├── navigation/
│   └── RootNavigator.tsx          ← React Navigation 配置
├── screens/
│   ├── ChatListScreen.tsx         ← 聊天列表頁面
│   ├── ChatScreen.tsx             ← 聊天詳情頁面
│   └── ProfileScreen.tsx          ← 個人頭像設定頁面
├── app/
│   └── _layout.tsx                ← 應用入口（已配置）
├── types.ts                       ← TypeScript 型別定義
└── MESSENGER_APP_README.md        ← 完整文檔
```

## ✨ 功能清單

### ✅ Messages 標籤
- 👥 顯示所有聊天對話列表
- 📋 每個對話卡片顯示：
  - 用戶名稱（首字母頭像）
  - 最後一條訊息預覽
  - 訊息時間戳
- 🔗 點擊進入該用戶的聊天詳情

### ✅ Chat 頁面
- 💬 顯示與用戶的完整對話歷史
- 🔵 自己的訊息：藍色右對齐
- ⚫ 對方的訊息：灰色左對齐
- ⌨️ 底部輸入框可發送新訊息
- 📱 Header 顯示聊天對象名稱

### ✅ Profile 標籤
- 🖼️ 顯示用戶頭像（預設或已選擇的圖片）
- 📱 **Choose from Gallery** - 從相簿選擇圖片
- 📷 **Take a Photo** - 使用相機拍照
- ✕ **Remove Photo** - 移除當前頭像
- ℹ️ 顯示用戶基本信息

## 🔧 技術堆棧

| 技術 | 版本 | 用途 |
|------|------|------|
| React Native | 0.81.5 | 跨平台 UI 框架 |
| Expo | ~54.0 | 開發和部署框架 |
| React Navigation | 7.x | 應用導航 |
| expo-image-picker | 最新 | 圖片選擇/相機 |
| TypeScript | ~5.9 | 型別安全 |

## 🎨 UI 組件

- **Bottom Tab Navigation** - Messages 和 Profile 兩個主標籤
- **Stack Navigation** - ChatList → Chat 詳情頁
- **FlatList** - 高效渲染長列表
- **TouchableOpacity** - 可點擊元素
- **React Native StyleSheet** - 應用樣式

## 💾 虛擬數據

應用默認載入的使用者：
- **Alice** - 4 條訊息
- **Bob** - 3 條訊息
- **Charlie** - 3 條訊息

所有數據定義在 `data/chatData.json` 中，可自由編輯。

## 🔑 關鍵文件說明

### `navigation/RootNavigator.tsx`
- 配置層級導航結構
- Bottom Tab Navigator（2 個標籤）
- Stack Navigator（聊天詳情頁）

### `screens/ChatListScreen.tsx`
- 載入並列表所有對話
- 支持點擊導航
- 顯示最後訊息預覽

### `screens/ChatScreen.tsx`
- 顯示選定用戶的對話
- 訊息區分（左/右）
- 發送新訊息邏輯

### `screens/ProfileScreen.tsx`
- 頭像展示和管理
- Expo ImagePicker 集成
- 相簿和相機權限處理

## 🎯 功能測試步驟

1. **啟動應用**
   ```bash
   npm start
   ```

2. **測試 Messages 標籤**
   - 應看到 3 個用戶卡片
   - 點擊任一用戶

3. **測試 Chat 頁面**
   - 看到歷史訊息
   - 訊息左右對齐正確
   - 在輸入框輸入訊息
   - 點擊 Send 發送

4. **測試 Profile 標籤**
   - 看到預設頭像
   - 點擊 "Choose from Gallery"
   - 選擇一張圖片上傳
   - 頭像應更新
   - 可點擊 Remove 刪除

## ⚙️ 信息權限

首次使用 Profile 標籤時，應用會請求：
- ✅ **媒體庫權限** - 相簿訪問
- ✅ **相機權限** - 拍照功能

## 📝 修改虛擬用戶

編輯 `data/chatData.json`：

```json
{
  "users": [
    {
      "id": "your_id",
      "name": "Your Name",
      "avatar": "url_or_emoji"
    }
  ],
  "conversations": [
    {
      "userId": "your_id",
      "userName": "Your Name",
      "messages": [
        {
          "id": "1",
          "sender": "User Name",
          "content": "Message text",
          "timestamp": "10:30 AM",
          "isOwn": false
        }
      ]
    }
  ]
}
```

## 🎓 學習重點

- ✅ React Navigation 層級導航
- ✅ Bottom Tab + Stack 組合
- ✅ TypeScript + Functional Components
- ✅ Hooks (useState, useEffect)
- ✅ FlatList 優化渲染
- ✅ Expo ImagePicker API
- ✅ 權限管理

## 🐛 故障排除

| 問題 | 解決方案 |
|------|----------|
| ImagePicker 無法工作 | 檢查 Android/iOS 權限設置 |
| 訊息未更新 | 確保 navigate 使用正確的 params |
| 頭像未顯示 | 檢查圖片 URI 有效性 |
| 熱重載不工作 | 重新啟動 Expo 伺服器 |

---

🎉 **祝您使用愉快！** 如有問題，請參考 [完整文檔](./MESSENGER_APP_README.md)
