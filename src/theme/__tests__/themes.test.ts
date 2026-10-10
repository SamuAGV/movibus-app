import {
    bestOnColor,
    buildCustomTheme,
    edgeColor,
    hexToHsl,
    hexToRgba,
    hslToHex,
    invertTheme,
    isValidHex,
    mapAccent,
    normalizeHex,
    CLASSIC_THEME,
  } from '../themes';
  
  describe('Utilidades de tema', () => {
    test('isValidHex acepta hex de 6 dígitos', () => {
      expect(isValidHex('#4D7C68')).toBe(true);
      expect(isValidHex('4D7C68')).toBe(false);
      expect(isValidHex('#FFF')).toBe(false);
    });
  
    test('normalizeHex expande hex corto y mayúsculas', () => {
      expect(normalizeHex('#fff')).toBe('#FFFFFF');
      expect(normalizeHex('4d7c68')).toBe('#4D7C68');
    });
  
    test('bestOnColor devuelve blanco en fondos oscuros', () => {
      expect(bestOnColor('#000000')).toBe('#FFFFFF');
    });
  
    test('bestOnColor devuelve negro en fondos claros', () => {
      expect(bestOnColor('#FFFFFF')).toBe('#000000');
    });
  
    test('invertTheme intercambia primary y onPrimary', () => {
      const invertido = invertTheme(CLASSIC_THEME);
      expect(invertido.primary).toBe(CLASSIC_THEME.onPrimary);
      expect(invertido.onPrimary).toBe(CLASSIC_THEME.primary);
    });
  
    test('buildCustomTheme genera un tema con id "custom"', () => {
      const tema = buildCustomTheme('#1A6B8A');
      expect(tema.id).toBe('custom');
      expect(tema.primary).toBe('#1A6B8A');
    });
  
    test('hexToHsl y hslToHex son inversos aproximados (con tolerancia)', () => {
      const original = '#4D7C68';
      const hsl = hexToHsl(original);
      const resultado = hslToHex(hsl.h, hsl.s, hsl.l);
    
      // Convertimos ambos a RGB y comparamos con tolerancia de ±2 por canal
      const toRgb = (hex: string) => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      });
    
      const a = toRgb(original);
      const b = toRgb(resultado);
    
      expect(Math.abs(a.r - b.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(a.g - b.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(a.b - b.b)).toBeLessThanOrEqual(2);
    });
  
    test('hexToRgba genera una cadena rgba válida', () => {
      expect(hexToRgba('#4D7C68', 0.5)).toBe('rgba(77,124,104,0.5)');
    });
  
    test('edgeColor devuelve un rgba con alpha 0.15', () => {
      expect(edgeColor(CLASSIC_THEME)).toContain('0.15');
    });
  
    test('mapAccent aclara el color en modo noche', () => {
      const day = mapAccent(CLASSIC_THEME, false);
      const night = mapAccent(CLASSIC_THEME, true);
      expect(day).toBe(CLASSIC_THEME.primary);
      expect(night).not.toBe(day);
    });
  });