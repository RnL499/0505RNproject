import { collection, getDocs, onSnapshot, query, Timestamp, where } from 'firebase/firestore';
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

const FindFriendsScreen: React.FC = () => {
  const {
    currentUser,
    friends,
    incomingRequests,
    outgoingRequests,
    searchAllUsers,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
  } = useApp();
  const [searchText, setSearchText] = useState('');
  const [searchResultsState, setSearchResultsState] = useState<UserProfile[]>([]);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [incomingRequestsState, setIncomingRequestsState] = useState<FriendRequestItem[]>(incomingRequests);
  const [outgoingRequestsState, setOutgoingRequestsState] = useState<FriendRequestItem[]>(outgoingRequests);

  const friendUidSet = useMemo(() => new Set(friends.map((f) => f.uid)), [friends]);
  const incomingUidSet = useMemo(
    () => new Set(incomingRequestsState.map((request) => request.fromUid)),
    [incomingRequestsState],
  );
  const outgoingUidSet = useMemo(
    () => new Set(outgoingRequestsState.map((request) => request.toUid)),
    [outgoingRequestsState],
  );

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

    if (cleanSearchInput.includes('@')) {
      console.log('🔍 開始搜尋用戶，搜尋字串為:', `"${cleanSearchInput}"`);
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        console.log('📊 Firestore 回傳的文件數量:', snapshot.size);

        const foundUsers: UserProfile[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as any;
            const dbEmail = ((data.email || data.Email || '') as string)
              .trim()
              .toLowerCase();
            return {
              uid: docSnap.id,
              name: data.name || '',
              email: data.email || data.Email || '',
              photoURL: data.photoURL || '',
              searchName: data.searchName || '',
              createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
              _normalizedEmail: dbEmail,
            } as UserProfile & { _normalizedEmail: string };
          })
          .filter((user) => user._normalizedEmail === cleanSearchInput)
          .filter((user) => user.uid !== currentUser?.uid)
          .map(({ _normalizedEmail, ...user }) => user);

        if (foundUsers.length === 0) {
          Alert.alert('查無此用戶');
          setSearchResultsState([]);
        } else {
          setSearchResultsState(foundUsers);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '搜尋用戶失敗';
        console.error('搜尋用戶錯誤:', message);
        Alert.alert('搜尋錯誤', message);
        setSearchResultsState([]);
      }
      return;
    }

    setSearchResultsState(searchAllUsers(cleanSearchInput));
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
      where('fromUid', '==', currentUser.uid),
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
        fromUid: data.fromUid || '',
        toUid: data.toUid || '',
        fromName: data.fromName || '',
        fromPhotoURL: data.fromPhotoURL || '',
        toName: data.toName || '',
        toPhotoURL: data.toPhotoURL || '',
        createdAt,
      };
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

  const handleSendRequest = async (friendUid: string, friendName: string) => {
    setActiveUid(friendUid);
    try {
      await addFriend(friendUid);
      Alert.alert('邀請已送出', `已向 ${friendName} 發送好友邀請`);
      setSearchText('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法發送邀請';
      Alert.alert('失敗', message);
    } finally {
      setActiveUid(null);
    }
  };

  const handleAcceptInvite = async (fromUid: string, fromName: string) => {
    setActiveUid(fromUid);
    try {
      await acceptFriendRequest(fromUid);
      Alert.alert('已接受', `已接受 ${fromName} 的好友邀請`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '無法接受邀請';
      Alert.alert('失敗', message);
    } finally {
      setActiveUid(null);
    }
  };

  const handleDeclineInvite = async (fromUid: string) => {
    setActiveUid(fromUid);
    try {
      await declineFriendRequest(fromUid);
    } catch {
      // ignore
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
                  disabled={activeUid === request.fromUid}
                  onPress={() => handleAcceptInvite(request.fromUid, request.fromName)}
                >
                  <Text style={styles.acceptButtonText}>
                    {activeUid === request.fromUid ? '...' : '接受'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  disabled={activeUid === request.fromUid}
                  onPress={() => handleDeclineInvite(request.fromUid)}
                >
                  <Text style={styles.declineButtonText}>拒絕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.searchTitle]}>搜尋加好友</Text>
      <Text style={styles.hint}>可用名稱、Email 或 ID 搜尋</Text>
      <TextInput
        style={styles.input}
        placeholder="輸入名稱 / Email / ID"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={() => handleSearch(searchText)}
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
                  onPress={() => handleSendRequest(item.uid, item.name)}
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
