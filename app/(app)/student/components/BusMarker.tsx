// src/components/BusMarker.tsx
//
// Autobús UTVT dibujado 100% en vectores (react-native-svg), sin usar ninguna imagen.
import React, { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

// ───────────────────────── Constantes de diseño ─────────────────────────
const C = {
  outline: '#0B3B24',
  green: '#1E8A4C',
  greenLight: '#4CBB7B',
  orange: '#F5A01F',
  glass: '#BCD8EA',
  glassShine: '#F4FAFF',
  white: '#FFFFFF',
  shadow: '#94A3B3',
  halo: '#34C759',
};

const VB_X = 140;
const VB_Y = 280;
const VB_W = 750;
const VB_H = 420;
const MIRROR_X = 2 * (VB_X + VB_W / 2); // 1030

const ICON_W = 104;
const ICON_H = Math.round((ICON_W * VB_H) / VB_W);

const BODY_PATH =
  'M218 432 Q214 405 242 398 L585 302 Q603 294 628 295 L768 302 Q806 308 815 338 L829 540 Q832 586 800 596 L250 598 Q218 592 216 560 Z';
const WINDSHIELD_PATH =
  'M648 362 Q730 346 800 360 Q822 372 820 405 L818 490 Q740 478 690 470 Q655 460 648 420 Z';

// ───────────────────────── Dibujo del autobús ─────────────────────────
interface BusDrawingProps {
  uid: string;
  facingLeft: boolean;
  selected: boolean;
  svgRef?: React.Ref<any>;
}

const BusDrawing = ({ uid, facingLeft, selected, svgRef }: BusDrawingProps) => {
  const cBody = `body-${uid}`;
  const cWind = `wind-${uid}`;
  const textX = facingLeft ? MIRROR_X - 470 : 470;

  return (
    <Svg
      ref={svgRef as any}
      width={ICON_W}
      height={ICON_H}
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
    >
      <Defs>
        <ClipPath id={cBody}>
          <Path d={BODY_PATH} />
        </ClipPath>
        <ClipPath id={cWind}>
          <Path d={WINDSHIELD_PATH} />
        </ClipPath>
      </Defs>

      <G transform={facingLeft ? `translate(${MIRROR_X} 0) scale(-1 1)` : undefined}>
        {selected && (
          <Ellipse cx={515} cy={642} rx={330} ry={38} fill={C.halo} opacity={0.35} />
        )}

        <Ellipse cx={620} cy={640} rx={190} ry={14} fill={C.shadow} opacity={0.7} />
        <Path
          d="M148 652 Q330 612 470 632 Q590 650 682 688 Q560 655 470 648 Q330 632 148 652 Z"
          fill={C.outline}
        />
        <Path d="M690 622 Q800 628 878 655 Q790 640 690 640 Z" fill={C.outline} />
        <Path d="M718 655 Q770 660 810 683 Q760 668 718 655 Z" fill={C.outline} />

        <Ellipse cx={430} cy={600} rx={30} ry={24} fill={C.outline} />
        <Ellipse cx={700} cy={596} rx={36} ry={28} fill={C.outline} />

        <Path
          d={BODY_PATH}
          fill={C.green}
          stroke={C.outline}
          strokeWidth={12}
          strokeLinejoin="round"
        />

        <G clipPath={`url(#${cBody})`}>
          <Path d="M216 524 Q330 506 400 500 Q442 520 448 604 L216 604 Z" fill={C.orange} />
          <Path d="M216 540 L570 510" stroke={C.outline} strokeWidth={5} fill="none" />
          <Path
            d="M628 545 Q700 566 760 552 Q800 540 832 540 L832 604 L628 604 Z"
            fill={C.orange}
          />
        </G>

        <Path
          d="M244 404 L590 311 Q606 306 630 307 L768 313"
          stroke={C.greenLight}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />

        <G fill={C.glass} stroke={C.outline} strokeWidth={6} strokeLinejoin="round">
          <Path d="M244 440 L276 431 L276 476 L244 486 Z" />
          <Path d="M291 422 L333 410 L333 472 L291 482 Z" />
          <Path d="M348 404 L397 390 L397 458 L348 470 Z" />
          <Path d="M411 385 L468 369 L468 440 L411 458 Z" />
          <Path d="M484 368 L549 359 L549 447 L484 452 Z" />
        </G>

        <Path
          d="M574 380 L612 373 L620 377 L618 505 L590 498 L574 490 Z"
          fill={C.glass}
          stroke={C.outline}
          strokeWidth={7}
          strokeLinejoin="round"
        />
        <Path d="M590 500 L592 380" stroke={C.outline} strokeWidth={5} />

        <Path d={WINDSHIELD_PATH} fill={C.glass} />
        <G clipPath={`url(#${cWind})`}>
          <Path d="M690 466 L762 356 L790 356 L718 474 Z" fill={C.glassShine} opacity={0.85} />
          <Path d="M742 480 L806 384 L822 384 L764 486 Z" fill={C.glassShine} opacity={0.85} />
        </G>
        <Path
          d={WINDSHIELD_PATH}
          fill="none"
          stroke={C.outline}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <Path
          d="M640 480 Q735 522 826 498"
          stroke={C.outline}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />

        <Rect
          x={686}
          y={326}
          width={82}
          height={22}
          rx={8}
          fill={C.orange}
          stroke={C.outline}
          strokeWidth={4}
        />

        <Rect x={654} y={366} width={26} height={50} rx={10} fill={C.outline} />
        <Path
          d="M822 364 Q858 354 858 396 L858 420"
          stroke={C.outline}
          strokeWidth={13}
          fill="none"
          strokeLinecap="round"
        />

        <Ellipse cx={668} cy={543} rx={20} ry={9} fill={C.white} rotation={12} origin="668, 543" />
        <Ellipse cx={806} cy={544} rx={17} ry={8} fill={C.white} rotation={-12} origin="806, 544" />

        <Ellipse cx={304} cy={590} rx={30} ry={38} fill={C.outline} />
        <Ellipse cx={304} cy={592} rx={15} ry={19} fill={C.glass} />
        <Ellipse cx={512} cy={584} rx={34} ry={46} fill={C.outline} />
        <Ellipse cx={512} cy={586} rx={17} ry={23} fill={C.glass} />
      </G>

      <SvgText
        x={textX}
        y={503}
        fontSize={34}
        fontWeight="bold"
        fill={C.white}
        textAnchor="middle"
        rotation={facingLeft ? 5 : -5}
        origin={`${textX}, 503`}
      >
        UTVT
      </SvgText>
    </Svg>
  );
};

// ───────────────────────── Almacén de sprites (Android) ─────────────────────────
type SpriteKey = 'RN' | 'RS' | 'LN' | 'LS';

const VARIANTS: Record<SpriteKey, { facingLeft: boolean; selected: boolean }> = {
  RN: { facingLeft: false, selected: false },
  RS: { facingLeft: false, selected: true },
  LN: { facingLeft: true, selected: false },
  LS: { facingLeft: true, selected: true },
};

let sprites: Partial<Record<SpriteKey, string>> = {};
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => sprites;
const setSprite = (key: SpriteKey, base64: string) => {
  sprites = { ...sprites, [key]: base64 };
  listeners.forEach((l) => l());
};

export const BusSpriteRenderer = () => {
  const refs = useRef<Partial<Record<SpriteKey, any>>>({});

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;

    const generate = (attempt: number) => {
      (Object.keys(VARIANTS) as SpriteKey[]).forEach((key) => {
        if (sprites[key]) return;
        refs.current[key]?.toDataURL((b64: string) => {
          if (!cancelled && b64) setSprite(key, b64);
        });
      });
      if (attempt < 3) {
        setTimeout(() => {
          if (!cancelled && Object.keys(sprites).length < 4) generate(attempt + 1);
        }, 400);
      }
    };

    const t = setTimeout(() => generate(0), 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (Platform.OS !== 'android') return null;

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{ position: 'absolute', left: -3000, top: 0, width: ICON_W, height: ICON_H * 4 }}
    >
      {(Object.keys(VARIANTS) as SpriteKey[]).map((key) => (
        <View key={key} collapsable={false} style={{ width: ICON_W, height: ICON_H }}>
          <BusDrawing
            uid={`sprite-${key}`}
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
  }, [selected, facingLeft]);

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
    const key: SpriteKey = `${facingLeft ? 'L' : 'R'}${selected ? 'S' : 'N'}` as SpriteKey;
    const b64 = store[key];
    if (!b64) return null;
    return (
      <Marker
        {...common}
        image={{ uri: `data:image/png;base64,${b64}` }}
        tracksViewChanges={false}
      />
    );
  }

  return (
    <Marker {...common} tracksViewChanges={tracking}>
      <View collapsable={false} style={{ width: ICON_W, height: ICON_H }}>
        <BusDrawing uid={id} facingLeft={facingLeft} selected={selected} />
      </View>
    </Marker>
  );
};

export const BusMarker = memo(BusMarkerBase);
export default BusMarker;