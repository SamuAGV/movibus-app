// app/(app)/__tests__/customization.test.tsx
import { render } from '@testing-library/react-native';
import React from 'react';

// ── Mocks ────────────────────────────────────────────────────

const mockUseAuth = jest.fn();
jest.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../../src/contexts/AppearanceContext', () => ({
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

jest.mock('../../../src/components/ProfilePhotoPicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-photo">ProfilePhotoPicker</Text>;
});
jest.mock('../../../src/components/AvatarPicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-avatar">AvatarPicker</Text>;
});
jest.mock('../../../src/components/ThemePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-theme">ThemePicker</Text>;
});
jest.mock('../../../src/components/BusTypePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-bus-type">BusTypePicker</Text>;
});
jest.mock('../../../src/components/AppearancePicker', () => {
  const { Text } = require('react-native');
  return () => <Text testID="picker-appearance">AppearancePicker</Text>;
});

import CustomizationScreen from '../customization';

// ── Tests ────────────────────────────────────────────────────

describe('CustomizationScreen — HU-40', () => {
  test('conductor ve ThemePicker + AppearancePicker, no foto/avatar/bus-type', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'd1', email: 'driver@test.com', name: 'Driver', role: 'driver' },
    });

    const { getByTestId, queryByTestId } = await render(<CustomizationScreen />);

    expect(getByTestId('picker-theme')).toBeTruthy();
    expect(getByTestId('picker-appearance')).toBeTruthy();

    expect(queryByTestId('picker-photo')).toBeNull();
    expect(queryByTestId('picker-avatar')).toBeNull();
    expect(queryByTestId('picker-bus-type')).toBeNull();
  });

  test('estudiante ve las 5 secciones completas', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 's1', email: 'student@test.com', name: 'Student', role: 'student' },
    });

    const { getByTestId } = await render(<CustomizationScreen />);

    expect(getByTestId('picker-photo')).toBeTruthy();
    expect(getByTestId('picker-avatar')).toBeTruthy();
    expect(getByTestId('picker-theme')).toBeTruthy();
    expect(getByTestId('picker-bus-type')).toBeTruthy();
    expect(getByTestId('picker-appearance')).toBeTruthy();
  });
});