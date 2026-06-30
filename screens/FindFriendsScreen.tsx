import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import UserAvatar from '@/components/UserAvatar';
import { BrandColors } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

const FindFriendsScreen: React.FC = () => {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchAllUsers,
    addFriend,
    acceptFriendRequest,
    declineFriendRequest,
  } = useApp();
  const [searchText, setSearchText] = useState('');
  const [activeUid, setActiveUid] = useState<string | null>(null);

  const friendUidSet = useMemo(() => new Set(friends.map((f) => f.uid)), [friends]);
  const incomingUidSet = useMemo(
    () => new Set(incomingRequests.map((request) => request.fromUid)),
    [incomingRequests],
  );
  const outgoingUidSet = useMemo(
    () => new Set(outgoingRequests.map((request) => request.toUid)),
    [outgoingRequests],
  );

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    return searchAllUsers(searchText);
  }, [searchAllUsers, searchText]);

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
      {incomingRequests.length === 0 ? (
        <Text style={styles.hint}>暫時沒有新的好友邀請</Text>
      ) : (
        <View style={styles.inviteList}>
          {incomingRequests.map((request) => (
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
    backgroundColor: '#f4efff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.standard,
    marginBottom: 8,
  },
  searchTitle: {
    marginTop: 24,
  },
  hint: {
    color: '#6d5b93',
    fontSize: 13,
    marginBottom: 12,
  },
  inviteList: {
    marginBottom: 20,
  },
  inviteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteTexts: {
    marginLeft: 12,
    flex: 1,
  },
  subtitle: {
    color: '#6d5b93',
    marginTop: 2,
  },
  inviteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  acceptButton: {
    backgroundColor: BrandColors.standard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  declineButton: {
    backgroundColor: '#f2f0ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  declineButtonText: {
    color: '#6d5b93',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8e0ff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0ecff',
  },
  resultInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f1143',
  },
  userEmail: {
    color: '#6d5b93',
    marginTop: 2,
    fontSize: 13,
  },
  userId: {
    color: '#a799c6',
    marginTop: 2,
    fontSize: 11,
  },
  addButton: {
    backgroundColor: BrandColors.standard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#f2f0ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusBadgeSecondary: {
    backgroundColor: '#e8e0ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: BrandColors.standard,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: {
    color: '#6d5b93',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default FindFriendsScreen;
