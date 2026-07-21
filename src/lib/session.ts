export const SESSION_COOKIE_NAME = 'fadefinder_session';

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

function getSecretKey(): string {
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.warn('⚠️ Warning: SESSION_SECRET environment variable is not set in production. Using fallback secret.');
  }
  return process.env.SESSION_SECRET || 'fadefinder_secret_key_2026_x89k_dev_prod_hash';
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function signHmac(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  const sessionData: UserSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
  };
  const jsonStr = JSON.stringify(sessionData);
  const base64Payload = base64UrlEncode(jsonStr);
  const signature = await signHmac(getSecretKey(), base64Payload);
  return `${base64Payload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Payload, signature] = parts;

    const expectedSignature = await signHmac(getSecretKey(), base64Payload);
    if (signature !== expectedSignature) {
      return null;
    }

    const payloadJson = base64UrlDecode(base64Payload);
    const session: UserSession = JSON.parse(payloadJson);

    if (session.exp && session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
