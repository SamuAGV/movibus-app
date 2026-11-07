// app/(app)/__tests__/customization.test.tsx
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// ── Mocks ────────────────────────────────────────────────────

const mockUseAuth = jest.fn();
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../src/contexts/AppearanceContext', () => ({
  useAppearance: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      card: '#F4F5F6',
      border: '#E2E4E7',
      text: '#1A1C1E',
      textSecondary: '#5F6368',
      brandText: '#4D7C68',
      tintGreen: '#E8F5E9',
      tintOrange: '#FFF3E0',
    },
    isDark: false,
  }),
}));

// Stubs para los pickers reales (no queremos testear sus internals aquí)
jest.mock('../../src/components/ProfilePhotoPicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-photo">ProfilePhotoPicker</Text>;
});
jest.mock('../../src/components/AvatarPicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-avatar">AvatarPicker</Text>;
});
jest.mock('../../src/components/ThemePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-theme">ThemePicker</Text>;
});
jest.mock('../../src/components/BusTypePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-bus-type">BusTypePicker</Text>;
});
jest.mock('../../src/components/AppearancePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-appearance">AppearancePicker</Text>;
});

import CustomizationScreen from '../customization';

// ── Tests ────────────────────────────────────────────────────

describe('CustomizationScreen — HU-40', () => {
  test('conductor ve ThemePicker + AppearancePicker, no foto/avatar/bus-type', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'd1', email: 'driver@test.com', name: 'Driver', role: 'driver' },
    });

    render(<CustomizationScreen />);

    expect(screen.getByTestId('picker-theme')).toBeTruthy();
    expect(screen.getByTestId('picker-appearance')).toBeTruthy();

    expect(screen.queryByTestId('picker-photo')).toBeNull();
    expect(screen.queryByTestId('picker-avatar')).toBeNull();
    expect(screen.queryByTestId('picker-bus-type')).toBeNull();
  });

  test('estudiante ve las 5 secciones completas', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 's1', email: 'student@test.com', name: 'Student', role: 'student' },
    });

    render(<CustomizationScreen />);

    expect(screen.getByTestId('picker-photo')).toBeTruthy();
    expect(screen.getByTestId('picker-avatar')).toBeTruthy();
    expect(screen.getByTestId('picker-theme')).toBeTruthy();
    expect(screen.getByTestId('picker-bus-type')).toBeTruthy();
    expect(screen.getByTestId('picker-appearance')).toBeTruthy();
  });
});