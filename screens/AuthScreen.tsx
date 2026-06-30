import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { DesignSystem } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import type { RootStackParamList } from '@/types';

type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const { register, login } = useApp();
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (isRegistering && !name)) {
      Alert.alert('缺少欄位', '請填寫所有必填欄位');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '請再試一次';
      Alert.alert('認證失敗', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.appName}>Line Chat</Text>
        <Text style={styles.title}>{isRegistering ? '建立帳號' : '歡迎回來'}</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? '使用 Email 註冊新帳號' : '登入以繼續使用'}
        </Text>

        {isRegistering ? (
          <TextInput
            style={styles.input}
            placeholder="顯示名稱"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="密碼"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isRegistering ? '註冊' : '登入'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegistering((prev) => !prev)}>
          <Text style={styles.switchText}>
            {isRegistering ? '已有帳號？登入' : '還沒有帳號？註冊'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: DesignSystem.colors.background.tertiary,
    padding: DesignSystem.spacing.lg,
  },
  card: {
    backgroundColor: DesignSystem.colors.background.primary,
    borderRadius: DesignSystem.borderRadius.lg,
    padding: DesignSystem.spacing.xl,
    ...DesignSystem.shadow.md,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignSystem.colors.primary,
    marginBottom: DesignSystem.spacing.xs,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: DesignSystem.spacing.md,
    textAlign: 'center',
    color: DesignSystem.colors.text.primary,
  },
  subtitle: {
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.lg,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: DesignSystem.colors.border.light,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    fontSize: 16,
    color: DesignSystem.colors.text.primary,
  },
  button: {
    backgroundColor: DesignSystem.colors.primary,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: DesignSystem.borderRadius.md,
    alignItems: 'center',
    marginTop: DesignSystem.spacing.md,
    minHeight: 48,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    marginTop: DesignSystem.spacing.lg,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AuthScreen;
