import { collection, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { db } from '@/api/firebaseConfig';
import UserAvatar from '@/components/UserAvatar';
import { DesignSystem } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import type { FriendRequestItem, UserProfile } from '@/types';
import { useNavigation } from '@react-navigation/native';

const FindFriendsScreen: React.FC = () => {
  const {
    currentUser,
    friends,
    searchAllUsers,
    createChatRoom,
  } = useApp();
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = useState('');
  const [searchResultsState, setSearchResultsState] = useState<UserProfile[]>([]);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [incomingRequestsState, setIncomingRequestsState] = useState<FriendRequestItem[]>([]);
  const [outgoingRequestsState, setOutgoingRequestsState] = useState<FriendRequestItem[]>([]);

  const friendUidSet = useMemo(() => new Set(friends.map((f) => f.uid)), [friends]);
  const incomingUidSet = useMemo(
    () => new Set(incomingRequestsState.map((request) => request.fromUid)),
    [incomingRequestsState],
  );
  const outgoingUidSet = useMemo(
    () => new Set(outgoingRequestsState.map((request) => request.toUid)),
    [outgoingRequestsState],
  );

  const requestItems = useMemo(() => {
    const map = new Map<string, FriendRequestItem>();
    outgoingRequestsState.forEach((item) => map.set(item.id, item));
    incomingRequestsState.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [incomingRequestsState, outgoingRequestsState]);

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    return searchResultsState;
  }, [searchResultsState, searchText]);

  const handleSearch = async (text: string) => {
    const cleanSearchInput = text.trim().toLowerCase();
    setSearchText(text);

    if (!cleanSearchInput) {
      setSearchResultsState([]);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const foundUsers: UserProfile[] = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            uid: docSnap.id,
            name: data.name || '',
            email: data.email || data.Email || '',
            photoURL: data.photoURL || '',
            searchName: data.searchName || data.name?.toLowerCase() || '',
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          } as UserProfile;
        })
        .filter((user) => user.uid !== currentUser?.uid)
        .filter((user) => {
          const lowerName = user.name.toLowerCase();
          const lowerEmail = user.email.toLowerCase();
          const lowerSearchName = user.searchName.toLowerCase();
          const lowerUid = user.uid.toLowerCase();
          return (
            lowerUid.includes(cleanSearchInput) ||
            lowerName.includes(cleanSearchInput) ||
            lowerEmail.includes(cleanSearchInput) ||
            lowerSearchName.includes(cleanSearchInput)
          );
        });

      setSearchResultsState(foundUsers);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '搜尋用戶失敗';
      console.error('搜尋用戶錯誤:', message);
      Alert.alert('搜尋錯誤', message);
      setSearchResultsState([]);
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const incomingQuery = query(
      collection(db, 'friendRequests'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'pending'),
    );
    const outgoingQuery = query(
      collection(db, 'friendRequests'),
      where('senderId', '==', currentUser.uid),
      where('status', '==', 'pending'),
    );

    const mapDocToRequest = (doc: any): FriendRequestItem => {
      const data = doc.data();
      const createdAtField = data.createdAt;
      let createdAt = new Date();
      if (createdAtField instanceof Timestamp) {
        createdAt = createdAtField.toDate();
      } else if (typeof createdAtField === 'string' || typeof createdAtField === 'number') {
        createdAt = new Date(createdAtField);
      }
      return {
        id: doc.id,
        fromUid: data.fromUid || data.senderId || '',
        toUid: data.toUid || data.receiverId || '',
        fromName: data.fromName || '',
        fromPhotoURL: data.fromPhotoURL || '',
        toName: data.toName || '',
        toPhotoURL: data.toPhotoURL || '',
        senderId: data.senderId || data.fromUid || '',
        receiverId: data.receiverId || data.toUid || '',
        status: data.status || 'pending',
        createdAt,
      } as FriendRequestItem & { senderId: string; receiverId: string; status: string };
    };

    const incomingUnsub = onSnapshot(incomingQuery, (snapshot) => {
      console.log('【好友監聽觸發】目前登入者 UID:', currentUser.uid, '抓到的邀請數量:', snapshot.docs.length);
      setIncomingRequestsState(snapshot.docs.map(mapDocToRequest));
    });

    const outgoingUnsub = onSnapshot(outgoingQuery, (snapshot) => {
      setOutgoingRequestsState(snapshot.docs.map(mapDocToRequest));
    });

    return () => {
      incomingUnsub();
      outgoingUnsub();
    };
  }, [currentUser]);

  const handleSendRequest = async (friendUid: string, friendName: string, friendPhotoURL: string) => {
    if (!currentUser?.uid) return;
    setActiveUid(friendUid);

    const requestId = [currentUser.uid, friendUid].sort().join('_');
    const requestRef = doc(db, 'friendRequests', requestId);

    try {
      await setDoc(requestRef, {
        senderId: currentUser.uid,
        receiverId: friendUid,
        status: 'pending',
        fromUid: currentUser.uid,
        toUid: friendUid,
        fromName: currentUser.name,
        fromPhotoURL: currentUser.photoURL,
        toName: friendName,
        toPhotoURL: friendPhotoURL,
        updatedAt: serverTimestamp(),
      });
      Alert.alert('邀請已送出', `已向 ${friendName} 發送好友邀請`);
      setSearchText('');
      setSearchResultsState([]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法發送邀請';
      console.error('發送好友邀請錯誤:', message);
      Alert.alert('失敗', message);
    } finally {
      setActiveUid(null);
    }
  };

  const handleAcceptInvite = async (item: FriendRequestItem) => {
    if (!currentUser?.uid) return;
    setActiveUid(item.id);
    try {
      const requestRef = doc(db, 'friendRequests', item.id);
      await updateDoc(requestRef, {
        status: 'accepted',
        updatedAt: serverTimestamp(),
      });
      Alert.alert('已接受', `已接受 ${item.fromName} 的好友邀請`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法接受邀請';
      console.error('接受好友邀請錯誤:', message);
      Alert.alert('失敗', message);
    } finally {
      setActiveUid(null);
    }
  };

  const handleDeclineInvite = async (item: FriendRequestItem) => {
    if (!currentUser?.uid) return;
    setActiveUid(item.id);
    try {
      const requestRef = doc(db, 'friendRequests', item.id);
      await updateDoc(requestRef, {
        status: 'declined',
        updatedAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法拒絕邀請';
      console.error('拒絕好友邀請錯誤:', message);
      Alert.alert('失敗', message);
    } finally {
      setActiveUid(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>好友邀請</Text>
      {incomingRequestsState.length === 0 ? (
        <Text style={styles.hint}>暫時沒有新的好友邀請</Text>
      ) : (
        <View style={styles.inviteList}>
          {incomingRequestsState.map((request) => (
            <View key={request.id} style={styles.inviteCard}>
              <View style={styles.inviteInfo}>
                <UserAvatar name={request.fromName} photoURL={request.fromPhotoURL} size={40} />
                <View style={styles.inviteTexts}>
                  <Text style={styles.userName}>{request.fromName}</Text>
                  <Text style={styles.subtitle}>想成為你的好友</Text>
                </View>
              </View>
              <View style={styles.inviteActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  disabled={activeUid === request.id}
                  onPress={() => handleAcceptInvite(request)}
                >
                  <Text style={styles.acceptButtonText}>
                    {activeUid === request.id ? '...' : '接受'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  disabled={activeUid === request.id}
                  onPress={() => handleDeclineInvite(request)}
                >
                  <Text style={styles.declineButtonText}>拒絕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.searchTitle]}>我的好友</Text>
      {friends.length === 0 ? (
        <Text style={styles.hint}>尚無好友，請先搜尋加好友</Text>
      ) : (
        <View style={styles.friendListSection}>
          {friends.map((friend) => (
            <TouchableOpacity
              key={friend.uid}
              style={styles.friendCard}
              activeOpacity={0.8}
              onPress={async () => {
                if (!currentUser?.uid) return;
                try {
                  const roomId = await createChatRoom(friend.uid);
                  // Navigate to Chats stack -> Chat screen
                  navigation.navigate('Chats' as any, {
                    screen: 'Chat',
                    params: { roomId, friendId: friend.uid, friendName: friend.name, friendPhotoURL: friend.photoURL },
                  });
                } catch (err) {
                  console.error('建立聊天室或導向失敗:', err);
                }
              }}
            >
              <UserAvatar name={friend.name} photoURL={friend.photoURL} size={42} />
              <View style={styles.friendInfo}>
                <Text style={styles.userName}>{friend.name}</Text>
                <Text style={styles.userEmail}>{friend.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.searchTitle]}>搜尋加好友</Text>
      <Text style={styles.hint}>可用名稱、Email 或 ID 搜尋</Text>
      <TextInput
        style={styles.input}
        placeholder="輸入名稱 / Email / ID"
        value={searchText}
        onChangeText={handleSearch}
        returnKeyType="search"
        autoCapitalize="none"
      />

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={
          searchText.trim() ? (
            <Text style={styles.emptyText}>找不到符合的使用者</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isFriend = friendUidSet.has(item.uid);
          const isIncoming = incomingUidSet.has(item.uid);
          const isOutgoing = outgoingUidSet.has(item.uid);
          return (
            <View style={styles.resultCard}>
              <UserAvatar name={item.name} photoURL={item.photoURL} size={44} />
              <View style={styles.resultInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userId}>ID: {item.uid}</Text>
              </View>
              {isFriend ? (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>已好友</Text>
                </View>
              ) : isIncoming ? (
                <View style={styles.statusBadgeSecondary}>
                  <Text style={styles.statusBadgeText}>已邀請你</Text>
                </View>
              ) : isOutgoing ? (
                <View style={styles.statusBadgeSecondary}>
                  <Text style={styles.statusBadgeText}>已發送邀請</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  disabled={activeUid === item.uid}
                  onPress={() => handleSendRequest(item.uid, item.name, item.photoURL)}
                >
                  <Text style={styles.addButtonText}>
                    {activeUid === item.uid ? '...' : '加好友'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.tertiary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  searchTitle: {
    marginTop: DesignSystem.spacing.xl,
  },
  hint: {
    color: DesignSystem.colors.text.secondary,
    fontSize: 13,
    marginBottom: DesignSystem.spacing.md,
  },
  inviteList: {
    marginBottom: DesignSystem.spacing.lg,
  },
  inviteCard: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    ...DesignSystem.shadow.md,
  },
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteTexts: {
    marginLeft: DesignSystem.spacing.md,
    flex: 1,
  },
  subtitle: {
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
    fontSize: 14,
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.sm,
  },
  acceptButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: DesignSystem.colors.primaryExtraLight,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  declineButtonText: {
    color: DesignSystem.colors.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  input: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    ...DesignSystem.shadow.sm,
  },
  resultInfo: {
    flex: 1,
  },
  friendListSection: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.lg,
    ...DesignSystem.shadow.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
  },
  friendInfo: {
    marginLeft: DesignSystem.spacing.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
  },
  userEmail: {
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
    fontSize: 13,
  },
  userId: {
    color: DesignSystem.colors.text.tertiary,
    marginTop: DesignSystem.spacing.xs,
    fontSize: 11,
  },
  addButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: DesignSystem.colors.primaryExtraLight,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minHeight: 32,
    justifyContent: 'center',
  },
  statusBadgeSecondary: {
    backgroundColor: DesignSystem.colors.primaryLight,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    minHeight: 32,
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: DesignSystem.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.md,
    textAlign: 'center',
  },
});

export default FindFriendsScreen;
