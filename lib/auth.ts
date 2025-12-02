import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { verifyAdminCredentials } from './admin-user-store';

// Types for authentication
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: 'admin' | 'editor';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  username: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// Configuration constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const TOKEN_EXPIRY = '15m'; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expires in 7 days
const SALT_ROUNDS = 12;

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export class AuthenticationService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate a JWT access token
   */
  static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
        issuer: 'goddess-admin',
        audience: 'goddess-admin-users',
      });
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Generate a JWT refresh token
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'goddess-admin',
        audience: 'goddess-admin-users',
      });
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Validate and decode a JWT token
   */
  static validateToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'goddess-admin',
        audience: 'goddess-admin-users',
      }) as TokenPayload;
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid token:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.warn('Token expired:', error.message);
      } else {
        console.error('Token validation error:', error);
      }
      return null;
    }
  }

  /**
   * Validate and decode a refresh token
   */
  static validateRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'goddess-admin',
        audience: 'goddess-admin-users',
      }) as RefreshTokenPayload;
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.warn('Invalid refresh token:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.warn('Refresh token expired:', error.message);
      } else {
        console.error('Refresh token validation error:', error);
      }
      return null;
    }
  }

  /**
   * Authenticate user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password } = credentials;

      // Validate input
      if (!username || !password) {
        return {
          success: false,
          error: 'Username and password are required',
        };
      }

      const verification = await verifyAdminCredentials(username, password);

      if (!verification.valid) {
        return {
          success: false,
          error: verification.error || 'Invalid credentials',
        };
      }

      // Generate tokens
      const resolvedUsername = verification.user?.username || username;
      const userId = `admin-${resolvedUsername}`;
      const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId,
        username: resolvedUsername,
        role: 'admin',
      };

      const refreshTokenPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
        userId,
        username: resolvedUsername,
        tokenVersion: 1, // In a real app, this would be stored in the database
      };

      const token = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(refreshTokenPayload);

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes from now

      return {
        success: true,
        token,
        refreshToken,
        expiresAt,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }

  /**
   * Refresh an access token using a refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const decoded = this.validateRefreshToken(refreshToken);
      if (!decoded) {
        return {
          success: false,
          error: 'Invalid refresh token',
        };
      }

      // Generate new access token
      const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId: decoded.userId,
        username: decoded.username,
        role: 'admin', // In a real app, this would be from the database
      };

      const token = this.generateToken(tokenPayload);

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes from now

      return {
        success: true,
        token,
        refreshToken, // Return the same refresh token
        expiresAt,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  /**
   * Set authentication cookies
   */
  static async setAuthCookies(token: string, refreshToken: string): Promise<void> {
    const cookieStore = await cookies();
    
    // Set access token cookie (expires in 15 minutes)
    cookieStore.set('auth-token', token, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes in seconds
    });

    // Set refresh token cookie (expires in 7 days)
    cookieStore.set('refresh-token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  }

  /**
   * Clear authentication cookies
   */
  static async clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies();
    
    cookieStore.delete('auth-token');
    cookieStore.delete('refresh-token');
  }

  /**
   * Get token from cookies
   */
  static async getTokenFromCookies(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('auth-token');
      return tokenCookie?.value || null;
    } catch (error) {
      console.error('Error getting token from cookies:', error);
      return null;
    }
  }

  /**
   * Get refresh token from cookies
   */
  static async getRefreshTokenFromCookies(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const refreshTokenCookie = cookieStore.get('refresh-token');
      return refreshTokenCookie?.value || null;
    } catch (error) {
      console.error('Error getting refresh token from cookies:', error);
      return null;
    }
  }

  /**
   * Logout user by clearing cookies
   */
  static async logout(): Promise<void> {
    await this.clearAuthCookies();
  }
}

// Utility function to get current user from token
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await AuthenticationService.getTokenFromCookies();
  if (!token) {
    return null;
  }

  return AuthenticationService.validateToken(token);
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Utility function to verify authentication for API routes
export async function verifyAuth(request: Request): Promise<{ success: boolean; user?: TokenPayload; error?: string }> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if user has admin or editor role
    if (user.role !== 'admin' && user.role !== 'editor') {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}
