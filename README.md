# 聊天應用使用者手冊

- 組員：11254007 張宇涵、11256012 魏銥霈、11256022 謝欣穎、11256041 林芯妤

這是一個基於 React Native 與 Expo 建立的聊天應用範例，提供簡單的介面與操作流程，讓使用者能夠瀏覽好友、進入聊天、查看設定頁面。

## 1. 產品簡介

本應用目前提供以下功能：
- Friends：查看好友清單
- Chats：進入聊天訊息列表與聊天畫面
- Settings：查看與修改個人設定
- Auth：登入或註冊畫面（目前為示範模式）

## 2. 系統需求

請先安裝以下工具：
- Node.js
- npm
- Expo CLI
- Android 模擬器 / iOS 模擬器 / Expo Go App

## 3. 安裝步驟

1. 開啟終端機，進入專案資料夾
   ```bash
   cd d:\0505RNproject
   ```

2. 安裝相依套件
   ```bash
   npm install
   ```

3. 啟動應用程式
   ```bash
   npx expo start
   ```

4. 使用以下任一方式開啟：
   - 掃描 QR Code 使用 Expo Go
   - 於 Android 模擬器中開啟
   - 於 iOS 模擬器中開啟

## 4. 使用方式

### 4.1 登入 / 註冊畫面
- 開啟 App 後，會先看到認證畫面。
- 可輸入名稱、電子郵件與密碼。
- 目前此版本為示範模式，操作後會顯示提示訊息，不會實際連接後端。

### 4.2 Friends 頁面
- 點選底部導覽列中的 Friends。
- 可查看示範好友清單。
- 之後可依需求擴充成真正的好友搜尋與加好友功能。

### 4.3 Chats 頁面
- 點選底部導覽列中的 Chats。
- 可看到聊天訊息列表。
- 點選任一聊天室，即可進入聊天畫面。
- 在聊天畫面中可輸入訊息並送出。

### 4.4 Settings 頁面
- 點選底部導覽列中的 Settings。
- 可輸入顯示名稱、個人圖片網址與密碼資訊。
- 目前為示範模式，修改內容會顯示提示訊息，不會同步到真實資料庫。

## 5. 常見問題

### Q1：如何啟動應用？
請執行：
```bash
npx expo start
```

### Q2：我沒有 Android 或 iOS 模擬器怎麼辦？
可以使用 Expo Go App 掃描 QR Code 直接開啟。

### Q3：目前這個版本有沒有連接 Firebase？
目前版本為本地示範版本，尚未接上 Firebase 後端。

## 6. 開發說明

專案主要檔案：
- app/_layout.tsx：應用主導航設定
- screens/AuthScreen.tsx：登入 / 註冊畫面
- screens/ChatListScreen.tsx：聊天列表
- screens/ChatScreen.tsx：聊天畫面
- screens/FindFriendsScreen.tsx：好友搜尋畫面
- screens/SettingsScreen.tsx：設定畫面

## 7. 備註

若後續要擴充成正式產品，建議再加入：
- 真實使用者登入
- 即時聊天功能
- 好友管理與搜尋
- 雲端資料儲存
