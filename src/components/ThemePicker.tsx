// src/components/ThemePicker.tsx
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  THEME_PRESETS,
  bestOnColor,
  edgeColor,
  hexToHsl,
  hslToHex,
  invertTheme,
  isValidHex,
  normalizeHex,
} from '../theme/themes';

const SEGMENTS = 40;
const THUMB = 30;

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  colorAt: (t: number) => string;
  onChange: (v: number) => void;
}

const ColorSlider = ({ label, value, min, max, colorAt, onChange }: SliderProps) => {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const rangeRef = useRef({ min, max });
  rangeRef.current = { min, max };

  const update = (x: number) => {
    if (!widthRef.current) return;
    const r = Math.min(1, Math.max(0, x / widthRef.current));
    onChangeRef.current(rangeRef.current.min + r * (rangeRef.current.max - rangeRef.current.min));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => update(e.nativeEvent.locationX),
      onPanResponderMove: (e) => update(e.nativeEvent.locationX),
    })
  ).current;

  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{Math.round(value)}</Text>
      </View>
      <View
        style={styles.track}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
          setWidth(e.nativeEvent.layout.width);
        }}
        {...pan.panHandlers}
      >
        <View style={styles.segments} pointerEvents="none">
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: colorAt(i / (SEGMENTS - 1)) }} />
          ))}
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { left: ratio * Math.max(0, width - THUMB), backgroundColor: colorAt(ratio) },
          ]}
        />
      </View>
    </View>
  );
};

export default function ThemePicker() {
  const { theme, selectedId, customColor, invertedIds, selectPreset, selectCustom, togglePresetInversion } = useTheme();
  const lastTap = useRef<{ id: string; time: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hsl, setHsl] = useState(() => hexToHsl(customColor || theme.primary));
  const [hexText, setHexText] = useState(() => normalizeHex(customColor || theme.primary));

  const draftHex = hslToHex(hsl.h, hsl.s, hsl.l);
  const typedValid = isValidHex(normalizeHex(hexText));
  const previewHex = typedValid ? normalizeHex(hexText) : draftHex;
  const previewOn = bestOnColor(previewHex);

  const openCustom = () => {
    const base = customColor || theme.primary;
    setHsl(hexToHsl(base));
    setHexText(normalizeHex(base));
    setModalVisible(true);
  };

  const setFromSlider = (patch: Partial<{ h: number; s: number; l: number }>) => {
    const next = { ...hsl, ...patch };
    setHsl(next);
    setHexText(hslToHex(next.h, next.s, next.l));
  };

  const onHexChange = (t: string) => {
    setHexText(t);
    const n = normalizeHex(t);
    if (isValidHex(n)) setHsl(hexToHsl(n));
  };

  const apply = () => {
    if (!typedValid) return;
    selectCustom(previewHex);
    setModalVisible(false);
  };

  const customActive = selectedId === 'custom' && !!customColor;

  const onPresetPress = (p: { id: string; invertible?: boolean }) => {
    const now = Date.now();
    const isDouble = lastTap.current?.id === p.id && now - lastTap.current.time < 350;
    lastTap.current = isDouble ? null : { id: p.id, time: now };
    if (isDouble && p.invertible) togglePresetInversion(p.id);
    else selectPreset(p.id);
  };

  return (
    <View>
      <Text style={styles.title}>Personalización</Text>
      <Text style={styles.subtitle}>
        Elige el color principal de la app. Textos, fondos y colores de estado no cambian.
        {'\n'}Toca dos veces las paletas con ⇄ para invertir sus colores.
      </Text>

      <View style={styles.grid}>
        {THEME_PRESETS.map((preset) => {
          const active = selectedId === preset.id;
          const p = preset.invertible && invertedIds.includes(preset.id) ? invertTheme(preset) : preset;
          return (
            <TouchableOpacity
              key={preset.id}
              activeOpacity={0.8}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => onPresetPress(preset)}
            >
              <View style={[styles.swatch, { backgroundColor: p.primary }]}>
                <Text style={[styles.swatchText, { color: p.onPrimary }]}>Aa</Text>
                <View style={[styles.swatchDot, { backgroundColor: p.onPrimary }]} />
                {preset.invertible && (
                  <Text style={[styles.swapBadge, { color: p.onPrimary }]}>⇄</Text>
                )}
              </View>
              <Text style={styles.cardLabel} numberOfLines={2}>{preset.label}</Text>
              {active && (
                <View style={[styles.check, { backgroundColor: theme.primary, borderColor: edgeColor(theme) }]}>
                  <Text style={[styles.checkText, { color: theme.onPrimary }]}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.card, customActive && styles.cardActive]}
          onPress={openCustom}
        >
          {customColor ? (
            <View style={[styles.swatch, { backgroundColor: customColor }]}>
              <Text style={[styles.swatchText, { color: bestOnColor(customColor) }]}>Aa</Text>
            </View>
          ) : (
            <View style={[styles.swatch, styles.swatchEmpty]}>
              <Text style={styles.swatchPlus}>+</Text>
            </View>
          )}
          <Text style={styles.cardLabel}>Personalizado</Text>
          {customActive && (
            <View style={[styles.check, { backgroundColor: theme.primary, borderColor: edgeColor(theme) }]}>
              <Text style={[styles.checkText, { color: theme.onPrimary }]}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Color personalizado</Text>

            <View style={[styles.preview, { backgroundColor: previewHex }]}>
              <Text style={[styles.previewTitle, { color: previewOn }]}>MoviBus</Text>
              <Text style={[styles.previewSub, { color: previewOn }]}>Así se verá tu header y botones</Text>
            </View>

            <ColorSlider
              label="Tono"
              value={hsl.h}
              min={0}
              max={360}
              colorAt={(t) => hslToHex(t * 360, hsl.s, hsl.l)}
              onChange={(v) => setFromSlider({ h: v })}
            />
            <ColorSlider
              label="Saturación"
              value={hsl.s}
              min={0}
              max={100}
              colorAt={(t) => hslToHex(hsl.h, t * 100, hsl.l)}
              onChange={(v) => setFromSlider({ s: v })}
            />
            <ColorSlider
              label="Luminosidad"
              value={hsl.l}
              min={8}
              max={92}
              colorAt={(t) => hslToHex(hsl.h, hsl.s, 8 + t * 84)}
              onChange={(v) => setFromSlider({ l: v })}
            />

            <Text style={styles.sliderLabel}>Código HEX</Text>
            <TextInput
              style={[styles.hexInput, !typedValid && styles.hexInvalid]}
              value={hexText}
              onChangeText={onHexChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              placeholder="#4D7C68"
              placeholderTextColor="#999"
            />
            {!typedValid && <Text style={styles.hexError}>Escribe un color válido, por ejemplo #4D7C68</Text>}

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: previewHex, borderWidth: 1, borderColor: '#E0E0E0' },
                  !typedValid && { opacity: 0.4 },
                ]}
                onPress={apply}
                disabled={!typedValid}
              >
                <Text style={[styles.btnApplyText, { color: previewOn }]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  subtitle: { fontSize: 12, color: '#999', marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '30.5%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f8f8f8',
  },
  cardActive: { borderColor: '#333' },
  swatch: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchText: { fontSize: 20, fontWeight: '700' },
  swatchDot: { position: 'absolute', right: 8, bottom: 8, width: 8, height: 8, borderRadius: 4 },
  swatchEmpty: { borderStyle: 'dashed', borderColor: '#BBB', backgroundColor: '#fff' },
  swatchPlus: { fontSize: 28, color: '#999', fontWeight: '300' },
  cardLabel: { fontSize: 11, color: '#333', marginTop: 6, fontWeight: '500', textAlign: 'center' },
  swapBadge: { position: 'absolute', left: 7, bottom: 3, fontSize: 14, fontWeight: '700', opacity: 0.8 },
  check: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: { fontSize: 12, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 14 },
  preview: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewTitle: { fontSize: 20, fontWeight: 'bold' },
  previewSub: { fontSize: 12, marginTop: 2, opacity: 0.85 },
  sliderBlock: { marginBottom: 14 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sliderLabel: { fontSize: 13, color: '#666', fontWeight: '500' },
  sliderValue: { fontSize: 13, color: '#999' },
  track: { height: THUMB, justifyContent: 'center' },
  segments: {
    ...StyleSheet.absoluteFillObject,
    top: 5,
    bottom: 5,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  hexInput: {
    marginTop: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  hexInvalid: { borderColor: '#FF3B30' },
  hexError: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 18 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnCancel: { backgroundColor: '#f0f0f0' },
  btnCancelText: { color: '#666', fontWeight: '600' },
  btnApplyText: { fontWeight: '700', fontSize: 16 },
});
