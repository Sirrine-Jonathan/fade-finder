import crypto from 'crypto';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

export { SESSION_COOKIE_NAME, createSessionToken, verifySessionToken, type UserSession } from './session';

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  try {
    const [salt, keyHex] = combinedHash.split(':');
    if (!salt || !keyHex) return false;
    const keyBuffer = Buffer.from(keyHex, 'hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export async function getSessionUser(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=').trim());
    }
  });

  return list;
}
