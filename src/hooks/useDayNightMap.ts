// src/hooks/useDayNightMap.ts
import { useEffect, useState } from 'react';
import { DARK_MAP_STYLE } from '../constants/mapStyles';

export function useDayNightMap() {
  const [isNight, setIsNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 19 || h < 6;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const h = new Date().getHours();
      setIsNight(h >= 19 || h < 6);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return {
    isNight,
    mapStyle: isNight ? DARK_MAP_STYLE : [],
    userInterfaceStyle: (isNight ? 'dark' : 'light') as 'dark' | 'light',
  };
}
