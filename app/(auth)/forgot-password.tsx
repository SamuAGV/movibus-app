// app/(auth)/forgot-password.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import {
  RESEND_SECONDS,
  requestPasswordReset,
  validateEmail,
} from '../../src/services/passwordReset';
import { APPEARANCE_COLORS } from '../../src/theme/appearance';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const scheme = useColorScheme();
  const colors = APPEARANCE_COLORS[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const disabled = sending || cooldown > 0;

  const handleSend = async () => {
    if (disabled) return;
    const validation = validateEmail(email);
    if (validation) {
      setInfo('');
      setError(validation);
      return;
    }
    setError('');
    setInfo('');
    setSending(true);
    const result = await requestPasswordReset(email);
    setSending(false);
    if (result.ok) {
      setInfo(result.message);
      setCooldown(RESEND_SECONDS);
    } else {
      setError(result.message);
      if (result.blocked) setCooldown(RESEND_SECONDS);
    }
  };

  const buttonLabel = cooldown > 0 ? `Reenviar en ${cooldown} s` : 'Enviar enlace';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
          <Ionicons name="key-outline" size={42} color={theme.onPrimary} />
        </View>

        <Text style={[styles.title, { color: colors.brandText }]}>Recuperar contraseña</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </Text>

        {error ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {info ? (
          <View
            style={[styles.infoBox, { backgroundColor: colors.tintGreen, borderColor: theme.primary }]}
          >
            <Text style={[styles.infoText, { color: colors.text }]}>{info}</Text>
          </View>
        ) : null}

        <View
          style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Correo electrónico"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!sending}
            onSubmitEditing={handleSend}
            testID="forgot-email"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }, disabled && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={disabled}
          accessibilityState={{ disabled }}
          testID="forgot-send"
        >
          {sending ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          testID="forgot-back"
        >
          <Text style={[styles.link, { color: colors.brandText }]}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 21 },
  errorBox: {
    backgroundColor: '#ffdddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ff5c5c',
  },
  errorText: { color: '#b00020', textAlign: 'center', fontWeight: '600' },
  infoBox: { borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1 },
  infoText: { textAlign: 'center', fontWeight: '500', lineHeight: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  button: { padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 20, fontWeight: '500' },
});
