// src/services/passwordReset.ts
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

export const RESEND_SECONDS = 60;

export const CONFIRMATION_MESSAGE =
  'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Devuelve el mensaje de error del campo, o null si el correo es válido. */
export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Ingresa tu correo electrónico.';
  if (!EMAIL_REGEX.test(email)) return 'Ingresa un correo electrónico válido.';
  return null;
}

export type ResetOutcome =
  | { ok: true; message: string }
  | { ok: false; message: string; blocked?: boolean };

/**
 * Pide a Firebase el correo de recuperación. Nunca revela si la cuenta existe:
 * "user-not-found" se trata igual que un envío correcto.
 */
export async function requestPasswordReset(rawEmail: string): Promise<ResetOutcome> {
  const email = rawEmail.trim();
  try {
    await sendPasswordResetEmail(auth, email);
    return { ok: true, message: CONFIRMATION_MESSAGE };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/user-not-found':
        return { ok: true, message: CONFIRMATION_MESSAGE };
      case 'auth/invalid-email':
        return { ok: false, message: 'Ingresa un correo electrónico válido.' };
      case 'auth/network-request-failed':
        return {
          ok: false,
          message: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
        };
      case 'auth/too-many-requests':
        return {
          ok: false,
          blocked: true,
          message: 'Demasiados intentos. Espera un momento antes de volver a intentarlo.',
        };
      default:
        return {
          ok: false,
          message: 'No se pudo enviar el enlace. Inténtalo de nuevo más tarde.',
        };
    }
  }
}
