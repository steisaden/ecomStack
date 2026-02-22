import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { redis } from './db/config';

// File-based storage for the single admin account. In a hosted environment
// this should be moved to a durable store (DB/Redis), but keeping it local
// lets the site owner set their own credentials without editing env vars.

const ADMIN_USER_FILE = path.join(process.cwd(), 'data', 'admin-user.json');
const ADMIN_USER_REDIS_KEY = 'admin:user';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

export interface AdminUserRecord {
  username: string;
  passwordHash: string;
  recoveryCodeHash: string;
  createdAt: string;
  updatedAt: string;
  resetTokenHash?: string;
  resetTokenExpiresAt?: string;
}

async function ensureDataDir() {
  const dir = path.dirname(ADMIN_USER_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readAdminUser(): Promise<AdminUserRecord | null> {
  if (redis) {
    try {
      const data = await redis.get(ADMIN_USER_REDIS_KEY);
      return data ? (JSON.parse(data) as AdminUserRecord) : null;
    } catch (error) {
      console.error('Failed to read admin user from Redis:', error);
      throw error;
    }
  }

  try {
    const data = await fs.readFile(ADMIN_USER_FILE, 'utf-8');
    const parsed = JSON.parse(data) as AdminUserRecord;
    return parsed;
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    console.error('Failed to read admin user file:', error);
    throw error;
  }
}

async function writeAdminUser(record: AdminUserRecord): Promise<void> {
  if (redis) {
    await redis.set(ADMIN_USER_REDIS_KEY, JSON.stringify(record));
    return;
  }

  await ensureDataDir();

  // Avoid persisting undefined reset metadata
  const toPersist: AdminUserRecord = {
    username: record.username,
    passwordHash: record.passwordHash,
    recoveryCodeHash: record.recoveryCodeHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };

  if (record.resetTokenHash) {
    toPersist.resetTokenHash = record.resetTokenHash;
  }
  if (record.resetTokenExpiresAt) {
    toPersist.resetTokenExpiresAt = record.resetTokenExpiresAt;
  }

  await fs.writeFile(ADMIN_USER_FILE, JSON.stringify(toPersist, null, 2), 'utf-8');
}

export async function adminUserExists(): Promise<boolean> {
  const user = await readAdminUser();
  return !!user;
}

export async function createAdminUser(username: string, password: string) {
  const existing = await readAdminUser();
  if (existing) {
    return { success: false, error: 'Admin account is already set up' } as const;
  }

  const normalizedUsername = username.trim();
  const passwordHash = await bcrypt.hash(password, 12);
  const recoveryCode = crypto.randomBytes(16).toString('hex');
  const recoveryCodeHash = hashString(recoveryCode);
  const timestamp = new Date().toISOString();

  const record: AdminUserRecord = {
    username: normalizedUsername,
    passwordHash,
    recoveryCodeHash,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await writeAdminUser(record);

  return { success: true, recoveryCode, user: record } as const;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const stored = await readAdminUser();

  // File-based credentials: owner must set them via admin setup.
  if (stored) {
    if (stored.username !== username.trim()) {
      return { valid: false, source: 'file' as const, error: 'Invalid credentials' };
    }

    const match = await bcrypt.compare(password, stored.passwordHash);
    if (match) {
      return { valid: true, source: 'file' as const, user: stored };
    } else {
      return { valid: false, source: 'file' as const, error: 'Invalid credentials' };
    }
  }

  // No file-based admin set up yet
  return { valid: false, source: 'file' as const, error: 'Admin credentials are not configured' };
}

export async function requestPasswordReset(username: string) {
  const stored = await readAdminUser();
  if (!stored) {
    return { success: false, error: 'Admin account has not been set up yet' } as const;
  }

  if (stored.username !== username.trim()) {
    return { success: false, error: 'Account not found' } as const;
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  const resetTokenHash = hashString(resetToken);
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  const updated: AdminUserRecord = {
    ...stored,
    resetTokenHash,
    resetTokenExpiresAt,
    updatedAt: new Date().toISOString(),
  };

  await writeAdminUser(updated);

  return { success: true, resetToken, expiresAt: resetTokenExpiresAt } as const;
}

export async function resetPassword(options: { token?: string; recoveryCode?: string; newPassword: string; }) {
  const stored = await readAdminUser();
  if (!stored) {
    return { success: false, error: 'Admin account has not been set up yet' } as const;
  }

  const { token, recoveryCode, newPassword } = options;
  const now = Date.now();
  let allowed = false;

  if (token) {
    if (!stored.resetTokenHash || !stored.resetTokenExpiresAt) {
      return { success: false, error: 'Reset token is invalid or has already been used' } as const;
    }

    const hashedToken = hashString(token);
    const expiresAt = Date.parse(stored.resetTokenExpiresAt);
    if (hashedToken === stored.resetTokenHash && expiresAt > now) {
      allowed = true;
    } else {
      return { success: false, error: 'Reset token is invalid or has expired' } as const;
    }
  }

  if (!allowed && recoveryCode) {
    const hashedRecovery = hashString(recoveryCode);
    if (hashedRecovery === stored.recoveryCodeHash) {
      allowed = true;
    } else {
      return { success: false, error: 'Recovery code is invalid' } as const;
    }
  }

  if (!allowed) {
    return { success: false, error: 'A valid reset token or recovery code is required' } as const;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated: AdminUserRecord = {
    ...stored,
    passwordHash,
    updatedAt: new Date().toISOString(),
  };

  // Clear reset token after successful reset
  delete updated.resetTokenHash;
  delete updated.resetTokenExpiresAt;

  await writeAdminUser(updated);

  return { success: true } as const;
}

export async function getAdminUsername() {
  const stored = await readAdminUser();
  if (stored) {
    return stored.username;
  }
  return null;
}

export function hashString(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
