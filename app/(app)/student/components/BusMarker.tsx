// app/(app)/student/components/BusMarker.tsx
//
// Marcador del vehículo en el mapa. El dibujo (autobús, taxi o van) es 100% vectorial
// (react-native-svg, ver src/components/VehicleDrawings.tsx) y depende del tipo que el
// estudiante eligió en Personalización (useBusType).
//
// Cómo funciona:
//  - En Android, Google Maps recortaba el marcador cuando lo capturaba como "vista".
//    Para evitarlo, <BusSpriteRenderer /> dibuja el SVG del tipo elegido fuera de pantalla,
//    lo convierte en PNG (toDataURL) y <BusMarker /> se lo pasa al mapa como imagen nativa.
//    Los sprites se guardan por tipo + dirección, así que cambiar de tipo solo genera los
//    que faltan.
//  - En iOS se sigue usando el SVG directamente como vista del marcador.
//  - flat={false} => el marcador es "billboard": siempre mira a la cámara, así que
//    al inclinar el mapa a 3D no se aplasta.
//  - El dibujo es una vista lateral: en vez de rotarlo con el heading, se espeja
//    (mira a la derecha si va al este, a la izquierda si va al oeste).
import React, { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { ICON_H, ICON_W, VehicleDrawing } from '../../../../src/components/VehicleDrawings';
import { BusTypeId } from '../../../../src/constants/busTypes';
import { useBusType } from '../../../../src/contexts/BusTypeContext';

// ───────────────────────── Almacén de sprites (Android) ─────────────────────────
type VariantKey = 'RN' | 'RS' | 'LN' | 'LS';

const VARIANTS: Record<VariantKey, { facingLeft: boolean; selected: boolean }> = {
  RN: { facingLeft: false, selected: false },
  RS: { facingLeft: false, selected: true },
  LN: { facingLeft: true, selected: false },
  LS: { facingLeft: true, selected: true },
};
const VARIANT_KEYS = Object.keys(VARIANTS) as VariantKey[];

const spriteId = (type: BusTypeId, v: VariantKey) => `${type}:${v}`;

let sprites: Record<string, string> = {};
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => sprites;
const setSprite = (id: string, base64: string) => {
  sprites = { ...sprites, [id]: base64 };
  listeners.forEach((l) => l());
};

export const BusSpriteRenderer = () => {
  const { busType } = useBusType();
  const refs = useRef<Partial<Record<VariantKey, any>>>({});

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;

    const missing = () => VARIANT_KEYS.filter((k) => !sprites[spriteId(busType, k)]);

    const generate = (attempt: number) => {
      missing().forEach((key) => {
        refs.current[key]?.toDataURL((b64: string) => {
          if (!cancelled && b64) setSprite(spriteId(busType, key), b64);
        });
      });
      if (attempt < 3) {
        setTimeout(() => {
          if (!cancelled && missing().length > 0) generate(attempt + 1);
        }, 400);
      }
    };

    const t = setTimeout(() => generate(0), 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [busType]);

  if (Platform.OS !== 'android') return null;

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{ position: 'absolute', left: -3000, top: 0, width: ICON_W, height: ICON_H * 4 }}
    >
      {VARIANT_KEYS.map((key) => (
        <View key={`${busType}-${key}`} collapsable={false} style={{ width: ICON_W, height: ICON_H }}>
          <VehicleDrawing
            type={busType}
            uid={`sprite-${busType}-${key}`}
            facingLeft={VARIANTS[key].facingLeft}
            selected={VARIANTS[key].selected}
            svgRef={(r: any) => {
              refs.current[key] = r;
            }}
          />
        </View>
      ))}
    </View>
  );
};

// ───────────────────────── Marcador ─────────────────────────
interface BusMarkerProps {
  id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  selected?: boolean;
  title?: string;
  description?: string;
  onPress?: () => void;
}

const BusMarkerBase = ({
  id,
  latitude,
  longitude,
  heading,
  selected = false,
  title,
  description,
  onPress,
}: BusMarkerProps) => {
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const { busType } = useBusType();

  const [facingLeft, setFacingLeft] = useState(false);
  useEffect(() => {
    if (typeof heading !== 'number' || heading < 0) return;
    const east = Math.sin((heading * Math.PI) / 180);
    if (Math.abs(east) > 0.25) setFacingLeft(east < 0);
  }, [heading]);

  const [tracking, setTracking] = useState(true);
  useEffect(() => {
    setTracking(true);
    const t = setTimeout(() => setTracking(false), 1500);
    return () => clearTimeout(t);
  }, [selected, facingLeft, busType]);

  const common = {
    coordinate: { latitude, longitude },
    title,
    description,
    onPress,
    flat: false,
    anchor: { x: 0.5, y: 0.86 },
    calloutAnchor: { x: 0.5, y: 0 },
    zIndex: selected ? 10 : 1,
  };

  if (Platform.OS === 'android') {
    const variant = `${facingLeft ? 'L' : 'R'}${selected ? 'S' : 'N'}` as VariantKey;
    const b64 = store[spriteId(busType, variant)];
    if (!b64) return null;
    return (
      <Marker
        key={`${busType}-${variant}`}
        {...common}
        image={{ uri: `data:image/png;base64,${b64}` }}
        tracksViewChanges={false}
      />
    );
  }

  return (
    <Marker key={busType} {...common} tracksViewChanges={tracking}>
      <View collapsable={false} style={{ width: ICON_W, height: ICON_H }}>
        <VehicleDrawing type={busType} uid={id} facingLeft={facingLeft} selected={selected} />
      </View>
    </Marker>
  );
};

export const BusMarker = memo(BusMarkerBase);
export default BusMarker;