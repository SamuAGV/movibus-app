// app/(auth)/__tests__/forgot-password.test.tsx
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { requestPasswordReset } from '../../../src/services/passwordReset';
import ForgotPasswordScreen from '../forgot-password';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({ router: { replace: (...a: unknown[]) => mockReplace(...a) } }));
jest.mock('../../../src/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: { id: 'classic', label: 'Clásico', primary: '#4D7C68', onPrimary: '#FFFFFF', edge: '#00000026' },
  }),
}));
jest.mock('firebase/auth', () => ({ sendPasswordResetEmail: jest.fn() }));
jest.mock('../../../src/services/firebase', () => ({ auth: {} }));
jest.mock('../../../src/services/passwordReset', () => {
  const actual = jest.requireActual('../../../src/services/passwordReset');
  return { ...actual, requestPasswordReset: jest.fn() };
});

const mockRequest = requestPasswordReset as jest.Mock;

const type = async (value: string) => {
  await fireEvent.changeText(screen.getByTestId('forgot-email'), value);
};
const press = async () => {
  await fireEvent.press(screen.getByTestId('forgot-send'));
};

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRequest.mockReset();
    mockReplace.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it('muestra error si el correo está vacío y no llama al servicio', async () => {
    await render(<ForgotPasswordScreen />);
    await press();
    expect(screen.getByText('Ingresa tu correo electrónico.')).toBeTruthy();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('muestra error si el formato es inválido', async () => {
    await render(<ForgotPasswordScreen />);
    await type('correo-malo');
    await press();
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeTruthy();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('envía el enlace, muestra la confirmación y bloquea el reenvío 60 s', async () => {
    mockRequest.mockResolvedValue({ ok: true, message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    await render(<ForgotPasswordScreen />);
    await type('alumno@escuela.com');
    await press();

    expect(mockRequest).toHaveBeenCalledWith('alumno@escuela.com');
    expect(screen.getByText(/Si el correo está registrado/)).toBeTruthy();
    expect(screen.getByText('Reenviar en 60 s')).toBeTruthy();
    expect(screen.getByTestId('forgot-send').props.accessibilityState.disabled).toBe(true);

    for (let i = 0; i < 60; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText('Enviar enlace')).toBeTruthy();
    expect(screen.getByTestId('forgot-send').props.accessibilityState.disabled).toBe(false);
  });

  it('muestra el error del servicio sin cerrar la pantalla', async () => {
    mockRequest.mockResolvedValue({ ok: false, message: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.' });
    await render(<ForgotPasswordScreen />);
    await type('alumno@escuela.com');
    await press();
    expect(screen.getByText(/Sin conexión/)).toBeTruthy();
    expect(screen.getByText('Enviar enlace')).toBeTruthy();
  });

  it('bloquea 60 s cuando hay demasiados intentos', async () => {
    mockRequest.mockResolvedValue({ ok: false, blocked: true, message: 'Demasiados intentos. Espera un momento antes de volver a intentarlo.' });
    await render(<ForgotPasswordScreen />);
    await type('alumno@escuela.com');
    await press();
    expect(screen.getByText(/Demasiados intentos/)).toBeTruthy();
    expect(screen.getByText('Reenviar en 60 s')).toBeTruthy();
  });

  it('el botón de volver regresa al inicio de sesión', async () => {
    await render(<ForgotPasswordScreen />);
    await fireEvent.press(screen.getByTestId('forgot-back'));
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
