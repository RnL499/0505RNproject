# 專案技術筆記

## 已套用到目前專案的技術

### 1. React Navigation
- 使用 Stack + Tabs 做頁面切換。
- 主要實作位置：
  - [app/_layout.tsx](app/_layout.tsx)
  - [screens/AuthScreen.tsx](screens/AuthScreen.tsx)

### 2. Props 與導覽參數傳遞
- 使用 navigation 進行頁面切換。
- 透過 navigation.navigate / navigation.replace 傳遞頁面資料。
- 目前已用於聊天頁從好友清單切換到對話頁。

### 3. ScrollView / FlatList
- 使用 FlatList 做大量清單顯示，效能比 ScrollView 更適合。
- 目前應用於：
  - [screens/ChatListScreen.tsx](screens/ChatListScreen.tsx)
  - [screens/FindFriendsScreen.tsx](screens/FindFriendsScreen.tsx)
  - [screens/ProfileScreen.tsx](screens/ProfileScreen.tsx)

### 4. Image Picker
- 使用 expo-image-picker 支援從相簿選圖與拍照。
- 目前應用於：
  - [screens/ProfileScreen.tsx](screens/ProfileScreen.tsx)

### 5. React Hooks
- 使用 useState 管理畫面狀態。
- 使用 useMemo 篩選好友與聊天資料。
- 使用 useEffect 處理資料更新與初始化邏輯。

## 專案目前的資料模式
- 目前是 demo / 本地假資料模式。
- 這樣方便先完成 UI 與流程。
- 後續接 Firebase 時，可把這些資料改成從 Firestore / Storage 讀寫。

## 未來可延伸的技術

### Firebase
- 可用於：
  - 使用者註冊 / 登入
  - 好友資料同步
  - 聊天訊息同步

### FastAPI / Backend
- 可做為後端 API，提供：
  - 使用者資料 CRUD
  - 聊天訊息 API
  - 好友關係 API

### SQLite / Local Database
- 如果先不接雲端，可先用本機資料庫儲存資料。
- 適合做離線 demo 或小型功能測試。
