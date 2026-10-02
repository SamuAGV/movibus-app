// src/hooks/useDayNightMap.ts
// Claro de 6:00 a 17:59 y oscuro de 18:00 a 5:59, según la hora del teléfono.
// Se actualiza solo al cruzar las 6:00 / 18:00 y al volver a abrir la app.
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { DARK_MAP_STYLE } from '../constants/mapStyles';

const DAY_START = 6;   // 6:00 am
const NIGHT_START = 18; // 6:00 pm

const isNightAt = (d: Date) => {
  const h = d.getHours();
  return h >= NIGHT_START || h < DAY_START;
};

const msUntilNextSwitch = (now: Date) => {
  const at = (dayOffset: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.getTime();
  };
  const next = [at(0, DAY_START), at(0, NIGHT_START), at(1, DAY_START)].find(
    (t) => t > now.getTime()
  )!;
  return next - now.getTime() + 500;
};

export function useDayNightMap() {
  const [isNight, setIsNight] = useState(() => isNightAt(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timer);
      const now = new Date();
      setIsNight(isNightAt(now));
      timer = setTimeout(schedule, msUntilNextSwitch(now));
    };

    schedule();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && schedule());
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return {
    isNight,
    mapStyle: isNight ? DARK_MAP_STYLE : undefined,
    userInterfaceStyle: (isNight ? 'dark' : 'light') as 'dark' | 'light',
  };
}