// src/services/__tests__/passwordReset.test.ts
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  CONFIRMATION_MESSAGE,
  requestPasswordReset,
  validateEmail,
} from '../passwordReset';

jest.mock('firebase/auth', () => ({ sendPasswordResetEmail: jest.fn() }));
jest.mock('../firebase', () => ({ auth: { name: 'auth-mock' } }));

const mockSend = sendPasswordResetEmail as jest.Mock;

describe('validateEmail', () => {
  it('rechaza vacío o solo espacios', () => {
    expect(validateEmail('')).toBe('Ingresa tu correo electrónico.');
    expect(validateEmail('   ')).toBe('Ingresa tu correo electrónico.');
  });

  it('rechaza formatos inválidos', () => {
    ['correo', 'correo@', '@dominio.com', 'a@b', 'a b@c.com'].forEach((v) => {
      expect(validateEmail(v)).toBe('Ingresa un correo electrónico válido.');
    });
  });

  it('acepta correos válidos', () => {
    expect(validateEmail('alumno@escuela.edu.mx')).toBeNull();
    expect(validateEmail('  alumno@escuela.com  ')).toBeNull();
  });
});

describe('requestPasswordReset', () => {
  beforeEach(() => mockSend.mockReset());

  it('envía el correo limpio y devuelve la confirmación', async () => {
    mockSend.mockResolvedValue(undefined);
    const res = await requestPasswordReset('  alumno@escuela.com ');
    expect(mockSend).toHaveBeenCalledWith({ name: 'auth-mock' }, 'alumno@escuela.com');
    expect(res).toEqual({ ok: true, message: CONFIRMATION_MESSAGE });
  });

  it('muestra el mismo mensaje si la cuenta no existe', async () => {
    mockSend.mockRejectedValue({ code: 'auth/user-not-found' });
    const res = await requestPasswordReset('nadie@escuela.com');
    expect(res).toEqual({ ok: true, message: CONFIRMATION_MESSAGE });
  });

  it('traduce correo inválido', async () => {
    mockSend.mockRejectedValue({ code: 'auth/invalid-email' });
    const res = await requestPasswordReset('x@y.com');
    expect(res.ok).toBe(false);
    expect(res.message).toBe('Ingresa un correo electrónico válido.');
  });

  it('traduce falta de conexión', async () => {
    mockSend.mockRejectedValue({ code: 'auth/network-request-failed' });
    const res = await requestPasswordReset('x@y.com');
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/Sin conexión/);
  });

  it('marca como bloqueado cuando hay demasiados intentos', async () => {
    mockSend.mockRejectedValue({ code: 'auth/too-many-requests' });
    const res = await requestPasswordReset('x@y.com');
    expect(res).toMatchObject({ ok: false, blocked: true });
    expect(res.message).toMatch(/Demasiados intentos/);
  });

  it('usa un mensaje genérico para errores desconocidos', async () => {
    mockSend.mockRejectedValue(new Error('boom'));
    const res = await requestPasswordReset('x@y.com');
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/No se pudo enviar/);
  });
});
