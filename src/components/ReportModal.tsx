// src/components/ReportModal.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppearance } from '../contexts/AppearanceContext';
import { useTheme } from '../contexts/ThemeContext';
import { submitIncident } from '../services/incidentService';
import { IncidentType } from '../types';

interface Props {
  visible: boolean;
  busId: string;
  tripId: string;
  uid: string;
  onClose: () => void;
}

const INCIDENT_TYPES: { type: IncidentType; label: string; icon: string }[] = [
  { type: 'delay', label: 'Retraso', icon: 'time-outline' },
  { type: 'mechanical', label: 'Falla mecánica', icon: 'construct-outline' },
  { type: 'blocked', label: 'Ruta bloqueada', icon: 'warning-outline' },
  { type: 'other', label: 'Otro', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function ReportModal({ visible, busId, tripId, uid, onClose }: Props) {
  const { colors } = useAppearance();
  const { theme } = useTheme();

  const [selected, setSelected] = useState<IncidentType | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setSelected(null);
    setComment('');
    setError('');
    setSuccess(false);
    setSending(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!selected) {
      setError('Selecciona un tipo de incidencia.');
      return;
    }
    setSending(true);
    setError('');
    // Simula latencia de red
    await new Promise((r) => setTimeout(r, 600));
    const result = submitIncident(busId, tripId, uid, selected, comment);
    setSending(false);
    if (!result.ok) {
      setError(result.error ?? 'Error al enviar el reporte.');
      return;
    }
    setSuccess(true);
    setTimeout(handleClose, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Reportar incidencia</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {success ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={48} color={colors.brandText} />
              <Text style={[styles.successText, { color: colors.text }]}>
                Reporte enviado correctamente
              </Text>
            </View>
          ) : sending ? (
            <View style={styles.successBox}>
              <ActivityIndicator size="large" color={colors.brandText} />
              <View style={[styles.skeletonLine, { backgroundColor: colors.border, width: '60%', marginTop: 16 }]} />
            </View>
          ) : (
            <>
              {/* Tipos */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de incidencia</Text>
              <View style={styles.typesGrid}>
                {INCIDENT_TYPES.map(({ type, label, icon }) => {
                  const active = selected === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        { borderColor: active ? theme.primary : colors.border, backgroundColor: active ? colors.tintGreen : colors.card },
                      ]}
                      onPress={() => setSelected(type)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                    >
                      <Ionicons
                        name={icon as any}
                        size={22}
                        color={active ? colors.brandText : colors.textSecondary}
                      />
                      <Text style={[styles.typeLabel, { color: active ? colors.brandText : colors.text }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Comentario */}
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Comentario opcional
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder="Describe brevemente la situación..."
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={(t) => setComment(t.slice(0, 140))}
                multiline
                maxLength={140}
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {comment.length}/140
              </Text>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                onPress={handleSend}
              >
                <Ionicons name="send" size={18} color={theme.onPrimary} />
                <Text style={[styles.sendText, { color: theme.onPrimary }]}>Enviar reporte</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  errorText: { color: '#e53935', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  sendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  sendText: { fontSize: 15, fontWeight: '700' },
  successBox: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  successText: { fontSize: 16, fontWeight: '600' },
  skeletonLine: { height: 12, borderRadius: 6 },
});
