import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from '../auth';

describe('Authentication & Session Helpers', () => {
  describe('hashPassword and verifyPassword', () => {
    it('should correctly hash a password and verify it successfully', async () => {
      const plainPassword = 'securePassword123!';
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeDefined();
      expect(hash).toContain(':');

      const isValid = await verifyPassword(plainPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const plainPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(plainPassword);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('createSessionToken and verifySessionToken', () => {
    it('should create a valid JWT-like session token and decode it', async () => {
      const payload = {
        userId: 'usr-123-abc',
        email: 'test@fadefinder.com',
        role: 'CLIENT',
      };

      const token = await createSessionToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe('usr-123-abc');
      expect(verified?.email).toBe('test@fadefinder.com');
      expect(verified?.role).toBe('CLIENT');
    });

    it('should return null for invalid or tampered tokens', async () => {
      const payload = {
        userId: 'usr-456-def',
        email: 'barber@fadefinder.com',
        role: 'PROVIDER',
      };

      const token = await createSessionToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      const result = await verifySessionToken(tamperedToken);
      expect(result).toBeNull();
    });
  });
});
