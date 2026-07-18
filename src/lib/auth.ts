import crypto from 'crypto';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const scryptAsync = promisify(crypto.scrypt);
export const SESSION_COOKIE_NAME = 'fadefinder_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'fadefinder_secret_key_2026_x89k_dev_prod_hash';

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

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

export function createSessionToken(payload: { userId: string; email: string; role: string }): string {
  const sessionData: UserSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
  };
  const jsonStr = JSON.stringify(sessionData);
  const base64Payload = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(base64Payload);
  const signature = hmac.digest('hex');
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): UserSession | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;

    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(base64Payload);
    const expectedSignature = hmac.digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf-8');
    const expSigBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (sigBuffer.length !== expSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expSigBuffer)) {
      return null;
    }

    const payloadJson = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const session: UserSession = JSON.parse(payloadJson);

    if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSessionUser(request: Request): Promise<UserSession | null> {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    return verifySessionToken(token);
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
