# Line 風格聊天 App

- 組員：11254007 張宇涵、11256012 魏銥霈、11256022 謝欣穎、11256041 林芯妤

React Native + Expo 製作的 Line 風格聊天應用，目前使用 **本地 AsyncStorage** 儲存資料（之後可替換為 Firebase / FastAPI）。

## 功能

- **註冊 / 登入**：Email + 密碼
- **好友**：以名稱、Email 或 ID 搜尋並加好友
- **聊天列表**：顯示最後一則訊息與時間、未讀數
- **聊天室**：各好友獨立聊天室，訊息含時間與頭像
- **設定**：修改名稱、密碼、頭像（ImagePicker 相簿 / 相機）
- **導覽**：Auth 跳轉頁 + Friends / Chats / Settings 三個 Tab

## 安裝與執行

```bash
cd D:\0630\0505RNproject
npm install
npx expo start
```

用 Expo Go 掃 QR Code，或按 `a` / `i` 開啟模擬器。

## 測試流程（建議至少 3 個帳號）

1. 註冊帳號 A（例如 `alice@test.com`）
2. 到 **Settings** 查看自己的 **ID**，記下來
3. 登出，註冊帳號 B、C
4. 用 B 登入 → **Friends** → 搜尋 A 的 Email 或 ID → 加好友
5. 到 **Chats** → 點 A → 傳訊息
6. 登出，用 A 登入 → 可看到 B 的訊息與未讀數

> 資料存在本機 AsyncStorage，同一支手機切換帳號可模擬雙方聊天。接上 Firebase 後可跨裝置同步。

## 專案結構

```
app/_layout.tsx          # 導覽 + Auth 切換
contexts/AppContext.tsx  # 全域狀態（登入、好友、聊天）
services/localDatabase.ts # AsyncStorage 資料層
screens/                 # 各頁面
components/UserAvatar.tsx
```

## 後續擴充

- `constants/firebaseConfig.ts`：Firebase 設定（待接入）
- `services/localDatabase.ts` 可替換為 Firestore / FastAPI API
