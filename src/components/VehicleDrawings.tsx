// src/components/VehicleDrawings.tsx
// Vehículos dibujados 100% en vectores (react-native-svg): autobús UTVT, taxi y van.
// Todos comparten el mismo viewBox, el mismo "suelo" (y ≈ 640) y la misma lógica de espejo,
// así que el marcador del mapa funciona igual con cualquiera de ellos.
// El dibujo es una vista lateral: en vez de rotarlo se espeja (facingLeft).
import React from 'react';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { BusTypeId } from '../constants/busTypes';

// viewBox compartido: "140 280 750 420" -> centro horizontal x = 515
export const VB_X = 140;
export const VB_Y = 280;
export const VB_W = 750;
export const VB_H = 420;
export const MIRROR_X = 2 * (VB_X + VB_W / 2); // 1030

// Tamaño en pantalla del marcador (dp)
export const ICON_W = 104;
export const iconHeight = (w: number) => Math.round((w * VB_H) / VB_W);
export const ICON_H = iconHeight(ICON_W);

const HALO = '#34C759';
const SHADOW = '#94A3B3';
const GLASS = '#BCD8EA';
const GLASS_SHINE = '#F4FAFF';
const WHITE = '#FFFFFF';

interface DrawingProps {
  uid: string;
  facingLeft: boolean;
  selected: boolean;
  width?: number;
  svgRef?: React.Ref<any>;
}

const Frame = ({ width = ICON_W, svgRef, children }: { width?: number; svgRef?: React.Ref<any>; children: React.ReactNode }) => (
  <Svg
    ref={svgRef as any}
    width={width}
    height={iconHeight(width)}
    viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
  >
    {children}
  </Svg>
);

const Mirror = ({ facingLeft, children }: { facingLeft: boolean; children: React.ReactNode }) => (
  <G transform={facingLeft ? `translate(${MIRROR_X} 0) scale(-1 1)` : undefined}>{children}</G>
);

const GroundShadow = ({ selected }: { selected: boolean }) => (
  <>
    {selected && <Ellipse cx={515} cy={642} rx={330} ry={38} fill={HALO} opacity={0.35} />}
    <Ellipse cx={530} cy={642} rx={320} ry={14} fill={SHADOW} opacity={0.7} />
  </>
);

const Wheel = ({ cx, outline, hub }: { cx: number; outline: string; hub: string }) => (
  <>
    <Ellipse cx={cx} cy={596} rx={36} ry={44} fill={outline} />
    <Ellipse cx={cx} cy={598} rx={18} ry={22} fill={hub} />
  </>
);

// ═════════════════════════ 1) AUTOBÚS UTVT ═════════════════════════
const BUS = {
  outline: '#0B3B24',
  green: '#1E8A4C',
  greenLight: '#4CBB7B',
  orange: '#F5A01F',
};
const BUS_BODY =
  'M218 432 Q214 405 242 398 L585 302 Q603 294 628 295 L768 302 Q806 308 815 338 L829 540 Q832 586 800 596 L250 598 Q218 592 216 560 Z';
const BUS_WINDSHIELD =
  'M648 362 Q730 346 800 360 Q822 372 820 405 L818 490 Q740 478 690 470 Q655 460 648 420 Z';

const BusDrawing = ({ uid, facingLeft, selected, width, svgRef }: DrawingProps) => {
  const cBody = `body-${uid}`;
  const cWind = `wind-${uid}`;
  const textX = facingLeft ? MIRROR_X - 470 : 470;
  const C = BUS;

  return (
    <Frame width={width} svgRef={svgRef}>
      <Defs>
        <ClipPath id={cBody}><Path d={BUS_BODY} /></ClipPath>
        <ClipPath id={cWind}><Path d={BUS_WINDSHIELD} /></ClipPath>
      </Defs>

      <Mirror facingLeft={facingLeft}>
        {selected && <Ellipse cx={515} cy={642} rx={330} ry={38} fill={HALO} opacity={0.35} />}

        {/* Sombra y camino */}
        <Ellipse cx={620} cy={640} rx={190} ry={14} fill={SHADOW} opacity={0.7} />
        <Path d="M148 652 Q330 612 470 632 Q590 650 682 688 Q560 655 470 648 Q330 632 148 652 Z" fill={C.outline} />
        <Path d="M690 622 Q800 628 878 655 Q790 640 690 640 Z" fill={C.outline} />
        <Path d="M718 655 Q770 660 810 683 Q760 668 718 655 Z" fill={C.outline} />

        {/* Ruedas lejanas */}
        <Ellipse cx={430} cy={600} rx={30} ry={24} fill={C.outline} />
        <Ellipse cx={700} cy={596} rx={36} ry={28} fill={C.outline} />

        {/* Carrocería */}
        <Path d={BUS_BODY} fill={C.green} stroke={C.outline} strokeWidth={12} strokeLinejoin="round" />
        <G clipPath={`url(#${cBody})`}>
          <Path d="M216 524 Q330 506 400 500 Q442 520 448 604 L216 604 Z" fill={C.orange} />
          <Path d="M216 540 L570 510" stroke={C.outline} strokeWidth={5} fill="none" />
          <Path d="M628 545 Q700 566 760 552 Q800 540 832 540 L832 604 L628 604 Z" fill={C.orange} />
        </G>

        {/* Franja clara del techo */}
        <Path d="M244 404 L590 311 Q606 306 630 307 L768 313" stroke={C.greenLight} strokeWidth={9} strokeLinecap="round" fill="none" />

        {/* Ventanas laterales */}
        <G fill={GLASS} stroke={C.outline} strokeWidth={6} strokeLinejoin="round">
          <Path d="M244 440 L276 431 L276 476 L244 486 Z" />
          <Path d="M291 422 L333 410 L333 472 L291 482 Z" />
          <Path d="M348 404 L397 390 L397 458 L348 470 Z" />
          <Path d="M411 385 L468 369 L468 440 L411 458 Z" />
          <Path d="M484 368 L549 359 L549 447 L484 452 Z" />
        </G>

        {/* Puerta */}
        <Path d="M574 380 L612 373 L620 377 L618 505 L590 498 L574 490 Z" fill={GLASS} stroke={C.outline} strokeWidth={7} strokeLinejoin="round" />
        <Path d="M590 500 L592 380" stroke={C.outline} strokeWidth={5} />

        {/* Parabrisas */}
        <Path d={BUS_WINDSHIELD} fill={GLASS} />
        <G clipPath={`url(#${cWind})`}>
          <Path d="M690 466 L762 356 L790 356 L718 474 Z" fill={GLASS_SHINE} opacity={0.85} />
          <Path d="M742 480 L806 384 L822 384 L764 486 Z" fill={GLASS_SHINE} opacity={0.85} />
        </G>
        <Path d={BUS_WINDSHIELD} fill="none" stroke={C.outline} strokeWidth={8} strokeLinejoin="round" />
        <Path d="M640 480 Q735 522 826 498" stroke={C.outline} strokeWidth={14} fill="none" strokeLinecap="round" />

        {/* Letrero de destino */}
        <Rect x={686} y={326} width={82} height={22} rx={8} fill={C.orange} stroke={C.outline} strokeWidth={4} />

        {/* Espejos */}
        <Rect x={654} y={366} width={26} height={50} rx={10} fill={C.outline} />
        <Path d="M822 364 Q858 354 858 396 L858 420" stroke={C.outline} strokeWidth={13} fill="none" strokeLinecap="round" />

        {/* Faros */}
        <Ellipse cx={668} cy={543} rx={20} ry={9} fill={WHITE} rotation={12} origin="668, 543" />
        <Ellipse cx={806} cy={544} rx={17} ry={8} fill={WHITE} rotation={-12} origin="806, 544" />

        {/* Ruedas */}
        <Ellipse cx={304} cy={590} rx={30} ry={38} fill={C.outline} />
        <Ellipse cx={304} cy={592} rx={15} ry={19} fill={GLASS} />
        <Ellipse cx={512} cy={584} rx={34} ry={46} fill={C.outline} />
        <Ellipse cx={512} cy={586} rx={17} ry={23} fill={GLASS} />
      </Mirror>

      {/* Texto fuera del grupo espejado para que nunca se lea al revés */}
      <SvgText
        x={textX}
        y={503}
        fontSize={34}
        fontWeight="bold"
        fill={WHITE}
        textAnchor="middle"
        rotation={facingLeft ? 5 : -5}
        origin={`${textX}, 503`}
      >
        UTVT
      </SvgText>
    </Frame>
  );
};

// ═════════════════════════ 2) TAXI ═════════════════════════
const TAXI = { outline: '#2A2100', yellow: '#FFC21A', yellowDark: '#E39F00', tire: '#3A3A3A', rim: '#D7DCE0' };
const TAXI_BODY =
  'M226 574 L226 492 Q226 466 254 462 L332 456 L386 398 Q396 388 416 388 L610 388 Q630 388 642 400 L718 472 L792 486 Q834 492 834 524 L834 574 Q834 596 808 598 L252 598 Q226 596 226 574 Z';

const TaxiWheel = ({ cx }: { cx: number }) => (
  <>
    <Ellipse cx={cx} cy={592} rx={48} ry={52} fill={TAXI.outline} />
    <Ellipse cx={cx} cy={596} rx={36} ry={44} fill={TAXI.tire} />
    <Ellipse cx={cx} cy={598} rx={19} ry={23} fill={TAXI.rim} />
    <Ellipse cx={cx} cy={598} rx={7} ry={9} fill={TAXI.outline} />
  </>
);

const TaxiDrawing = ({ uid, facingLeft, selected, width, svgRef }: DrawingProps) => {
  const cBody = `taxi-body-${uid}`;
  const C = TAXI;
  const signX = 500;
  const textX = facingLeft ? MIRROR_X - signX : signX;

  return (
    <Frame width={width} svgRef={svgRef}>
      <Defs>
        <ClipPath id={cBody}><Path d={TAXI_BODY} /></ClipPath>
      </Defs>

      <Mirror facingLeft={facingLeft}>
        <GroundShadow selected={selected} />

        {/* FRENTE: haz de luz */}
        <Path d="M836 506 L888 484 L888 540 Z" fill="#FFF3B0" opacity={0.55} />

        {/* ATRÁS: escape */}
        <Ellipse cx={224} cy={586} rx={9} ry={5} fill="#6B7280" stroke={C.outline} strokeWidth={3} />

        {/* Carrocería */}
        <Path d={TAXI_BODY} fill={C.yellow} stroke={C.outline} strokeWidth={12} strokeLinejoin="round" />
        <G clipPath={`url(#${cBody})`}>
          <Path d="M226 552 L834 552 L834 600 L226 600 Z" fill={C.yellowDark} />
          <Rect x={226} y={508} width={608} height={24} fill={C.outline} />
          <Path d="M226 514 L834 514" stroke={WHITE} strokeWidth={12} strokeDasharray={[12, 12]} />
          <Path d="M226 526 L834 526" stroke={WHITE} strokeWidth={12} strokeDasharray={[12, 12]} strokeDashoffset={12} />
        </G>

        <Path d="M300 458 L300 506" stroke={C.outline} strokeWidth={4} opacity={0.55} />
        <Path d="M724 476 L790 490" stroke={C.outline} strokeWidth={4} opacity={0.55} />

        {/* Ventanas */}
        <G fill={GLASS} stroke={C.outline} strokeWidth={6} strokeLinejoin="round">
          <Path d="M352 452 L396 406 L476 406 L476 452 Z" />
          <Path d="M494 452 L494 406 L612 406 Q626 406 636 416 L690 452 Z" />
        </G>
        <Path d="M404 452 L430 406 L444 406 L418 452 Z" fill={GLASS_SHINE} opacity={0.8} />
        <Path d="M485 404 L485 506" stroke={C.outline} strokeWidth={5} />
        <Rect x={448} y={470} width={22} height={7} rx={3} fill={C.outline} />
        <Rect x={500} y={470} width={22} height={7} rx={3} fill={C.outline} />

        <Rect x={648} y={408} width={20} height={14} rx={4} fill={C.outline} />

        {/* FRENTE: faro, intermitente y defensa */}
        <Path d="M800 494 Q834 498 834 520 L808 520 Q800 508 800 494 Z" fill="#FFFBE0" stroke={C.outline} strokeWidth={4} strokeLinejoin="round" />
        <Rect x={806} y={528} width={16} height={8} rx={3} fill="#F59E0B" />
        <Rect x={800} y={556} width={40} height={26} rx={8} fill="#4B5563" stroke={C.outline} strokeWidth={5} />

        {/* ATRÁS: calavera y defensa */}
        <Rect x={222} y={476} width={18} height={38} rx={5} fill="#E5383B" stroke={C.outline} strokeWidth={4} />
        <Rect x={220} y={556} width={40} height={26} rx={8} fill="#4B5563" stroke={C.outline} strokeWidth={5} />

        {/* Letrero del techo */}
        <Rect x={455} y={358} width={90} height={32} rx={8} fill={WHITE} stroke={C.outline} strokeWidth={5} />

        {/* Ruedas */}
        <TaxiWheel cx={336} />
        <TaxiWheel cx={724} />
      </Mirror>

      <SvgText x={textX} y={382} fontSize={22} fontWeight="bold" fill={C.outline} textAnchor="middle">
        TAXI
      </SvgText>
    </Frame>
  );
};

// ═════════════════════════ 3) VAN DE PASAJEROS ═════════════════════════
const VAN = { outline: '#1F2A37', body: '#F4F6F8', blue: '#2F6FDE', bumper: '#4B5563' };
const VAN_BODY =
  'M228 572 L228 372 Q228 344 258 342 L664 338 Q690 338 704 358 L766 462 L808 474 Q834 482 834 512 L834 572 Q834 596 808 598 L254 598 Q228 596 228 572 Z';

const VanDrawing = ({ uid, facingLeft, selected, width, svgRef }: DrawingProps) => {
  const cBody = `van-body-${uid}`;
  const C = VAN;

  return (
    <Frame width={width} svgRef={svgRef}>
      <Defs>
        <ClipPath id={cBody}><Path d={VAN_BODY} /></ClipPath>
      </Defs>

      <Mirror facingLeft={facingLeft}>
        <GroundShadow selected={selected} />

        {/* Portaequipaje del techo */}
        <Path d="M292 330 L632 330" stroke={C.outline} strokeWidth={7} strokeLinecap="round" />
        <Path d="M320 330 L320 342 M600 330 L600 342" stroke={C.outline} strokeWidth={6} strokeLinecap="round" />

        {/* Carrocería */}
        <Path d={VAN_BODY} fill={C.body} stroke={C.outline} strokeWidth={12} strokeLinejoin="round" />
        <G clipPath={`url(#${cBody})`}>
          <Path d="M228 488 L834 488 L834 532 L228 532 Z" fill={C.blue} />
          <Path d="M228 494 L834 494" stroke={WHITE} strokeWidth={3} opacity={0.6} />
        </G>

        {/* Ventanas */}
        <G fill={GLASS} stroke={C.outline} strokeWidth={6} strokeLinejoin="round">
          <Rect x={256} y={372} width={82} height={76} rx={8} />
          <Rect x={352} y={372} width={82} height={76} rx={8} />
          <Rect x={448} y={372} width={82} height={76} rx={8} />
          <Path d="M596 372 L664 370 Q676 370 684 384 L722 450 L596 450 Z" />
        </G>
        <Path d="M372 448 L396 372 L410 372 L386 448 Z" fill={GLASS_SHINE} opacity={0.7} />

        {/* Puertas */}
        <Path d="M540 366 L540 562 M586 366 L586 562" stroke={C.outline} strokeWidth={5} />
        <Rect x={552} y={446} width={22} height={7} rx={3} fill={C.outline} />
        <Rect x={598} y={462} width={22} height={7} rx={3} fill={C.outline} />

        {/* Espejo, faro, calavera y defensa */}
        <Path d="M716 398 Q744 394 744 424" stroke={C.outline} strokeWidth={11} fill="none" strokeLinecap="round" />
        <Ellipse cx={824} cy={504} rx={9} ry={14} fill="#FFF6C9" stroke={C.outline} strokeWidth={4} />
        <Rect x={226} y={470} width={10} height={26} rx={3} fill="#E5383B" />
        <Rect x={806} y={552} width={32} height={30} rx={8} fill={C.bumper} stroke={C.outline} strokeWidth={5} />

        {/* Ruedas */}
        <Wheel cx={350} outline={C.outline} hub={GLASS} />
        <Wheel cx={732} outline={C.outline} hub={GLASS} />
      </Mirror>
    </Frame>
  );
};

// ═════════════════════════ Selector por tipo ═════════════════════════
export const VehicleDrawing = ({ type, ...rest }: DrawingProps & { type: BusTypeId }) => {
  switch (type) {
    case 'taxi':
      return <TaxiDrawing {...rest} />;
    case 'van':
      return <VanDrawing {...rest} />;
    default:
      return <BusDrawing {...rest} />;
  }
};