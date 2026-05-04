# 簡易 Facebook Messenger 風格聊天 App

這是一個使用 React Native (Expo) 和 React Navigation 開發的聊天應用程式。

## 功能特性

### ✅ 已實現功能

1. **聊天列表頁面 (ChatList)**
   - 顯示所有使用者對話列表
   - 每個使用者卡片展示：名稱、最後一條訊息、時間戳
   - 點擊使用者進入對話頁面

2. **聊天頁面 (Chat)**
   - 顯示與特定使用者的對話記錄
   - 訊息自動左右對齐（區分自己和對方）
   - 輸入框發送新訊息功能
   - 頁面頂部顯示聊天室名稱

3. **個人頁面 (Profile)**
   - 顯示使用者頭像（預設圖片或上傳的圖片）
   - 「從相簿選擇圖片」功能
   - 「拍照」功能（使用相機）
   - 移除頭像按鈕
   - 顯示使用者基本信息

4. **導覽結構**
   - Bottom Tab Navigation：Messages（訊息）和 Profile（個人）
   - Stack Navigation：支持從聊天列表導航到聊天詳情頁

## 項目結構

```
RNprjs/
├── data/
│   └── chatData.json          # 聊天資料（虛擬數據）
├── navigation/
│   └── RootNavigator.tsx      # React Navigation 配置
├── screens/
│   ├── ChatListScreen.tsx     # 聊天列表頁面
│   ├── ChatScreen.tsx         # 聊天詳情頁面
│   └── ProfileScreen.tsx      # 個人頭像設定頁面
├── app/
│   └── _layout.tsx            # 應用入口（已修改使用 RootNavigator）
├── types.ts                   # TypeScript 型別定義
└── package.json
```

## 技術棧

- **React Native** 0.81.5
- **Expo** ~54.0
- **React Navigation** 7.x
  - `@react-navigation/native` - 核心導航庫
  - `@react-navigation/bottom-tabs` - 底部標籤導航
  - `@react-navigation/stack` - 堆棧導航
- **Expo ImagePicker** - 圖片選擇和相機功能
- **TypeScript** - 型別安全
- **React Native** functional components + hooks

## 使用指南

### 安裝依賴

```bash
cd RNprjs
npm install
```

### 運行應用

```bash
# 啟動 Expo 開發服務器
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### 聊天資料

聊天資料存儲在 `data/chatData.json` 中，包含：
- 虛擬使用者列表（Alice, Bob, Charlie）
- 每個使用者的對話記錄
- 訊息時間戳和發送人信息

## 核心功能說明

### 1. ChatListScreen
- 載入並顯示所有對話
- 每個對話卡片可點擊進入詳情頁
- 顯示最後一條訊息和時間

### 2. ChatScreen
- 顯示選定使用者的完整對話歷史
- 訊息分別用藍色（自己的訊息）和灰色（對方的訊息）顯示
- 底部輸入框支持輸入新訊息
- 按下 Send 按鈕發送訊息
- 自動更新訊息列表

### 3. ProfileScreen
- 顯示預設頭像或用戶上傳的圖片
- 三個主要按鈕：
  - 📱 Choose from Gallery - 從手機相簿選擇圖片
  - 📷 Take a Photo - 使用相機拍照
  - ✕ Remove Photo - 移除當前頭像
- 顯示使用者基本信息

## 許可證和權限

應用使用以下 Expo ImagePicker 權限：
- **相機權限** - 拍照功能
- **媒體庫權限** - 相簿選擇功能

首次使用時會請求相應權限。

## 開發提示

1. **虛擬數據**：所有聊天內容和使用者信息都是虛擬的，存儲在 `data/chatData.json`

2. **頭像**：第一次運行時顯示初始字母，可通過 ImagePicker 上傳真實圖片

3. **訊息時間**：新訊息會自動使用當前時間，格式為 HH:mm

4. **樣式**：使用 React Native StyleSheet，易於自定義顏色和佈局

## 後續改進方向

- 整合真實後端/數據庫
- 添加使用者認證
- 實現即時通訊（WebSocket）
- 支持圖片/視頻分享
- 添加更多訊息類型（表情符號、語音等）
- 本地數據持久化
- 通知功能

## 常見問題

**Q: 如何修改虛擬數據？**
A: 編輯 `data/chatData.json` 文件

**Q: 選擇的圖片保存在哪裡？**
A: 圖片 URI 存儲在組件狀態中，應用關閉后會重置

**Q: 如何增加更多使用者？**
A: 編輯 `data/chatData.json` 的 `users` 和 `conversations` 陣列

---

祝您使用愉快！ 😊
