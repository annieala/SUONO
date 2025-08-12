// server/generateToken.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Types for the JWT payload and configuration
interface AppleMusicTokenPayload {
  iss: string; // Issuer (Team ID)
  iat: number; // Issued at
  exp: number; // Expiration
}

interface AppleMusicConfig {
  teamId: string;
  keyId: string;
  privateKeyPath: string;
}

/**
 * Generates an Apple Music API developer token
 * @param config - Configuration object with team ID, key ID, and private key path
 * @returns JWT token string for Apple Music API authentication
 */
export function generateAppleMusicToken(config: AppleMusicConfig): string {
  try {
    // Validate configuration
    if (!config.teamId || !config.keyId || !config.privateKeyPath) {
      throw new Error('Missing required configuration: teamId, keyId, or privateKeyPath');
    }

    // Read the private key file
    if (!fs.existsSync(config.privateKeyPath)) {
      throw new Error(`Private key file not found: ${config.privateKeyPath}`);
    }

    const privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');

    // JWT options for Apple Music API - using correct SignOptions type
    const tokenOptions: SignOptions = {
      algorithm: 'ES256',
      expiresIn: '6m', // 6 months max (Apple's limit)
      issuer: config.teamId,
      keyid: config.keyId // Use 'keyid' instead of header.kid
    };

    // Create empty payload (Apple Music tokens don't need payload data)
    const payload = {};

    // Generate the token
    const token = jwt.sign(payload, privateKey, tokenOptions);

    console.log('✅ Apple Music token generated successfully');
    return token;

  } catch (error) {
    console.error('❌ Error generating Apple Music token:', error);
    throw error;
  }
}

/**
 * Alternative implementation using manual header setting
 * Use this if the keyid option doesn't work as expected
 */
export function generateAppleMusicTokenWithHeader(config: AppleMusicConfig): string {
  try {
    // Validate configuration
    if (!config.teamId || !config.keyId || !config.privateKeyPath) {
      throw new Error('Missing required configuration: teamId, keyId, or privateKeyPath');
    }

    const privateKey = fs.readFileSync(config.privateKeyPath, 'utf8');

    // Manual JWT creation with custom header
    const header = {
      alg: 'ES256' as const,
      kid: config.keyId
    };

    const payload = {
      iss: config.teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60) // 6 months
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header
    });

    console.log('✅ Apple Music token generated successfully (with header)');
    return token;

  } catch (error) {
    console.error('❌ Error generating Apple Music token:', error);
    throw error;
  }
}

/**
 * Validates if a token is still valid (not expired)
 * @param token - JWT token to validate
 * @returns boolean indicating if token is valid
 */
export function validateAppleMusicToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    
    if (!decoded || !decoded.exp) {
      return false;
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = decoded.exp - 300; // 5 minute buffer
    
    return now < expiresAt;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Creates configuration from environment variables
 * @returns AppleMusicConfig object
 */
export function createConfigFromEnv(): AppleMusicConfig {
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const privateKeyPath = process.env.APPLE_MUSIC_PRIVATE_KEY_PATH;

  if (!teamId || !keyId || !privateKeyPath) {
    throw new Error('Missing required environment variables: APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, APPLE_MUSIC_PRIVATE_KEY_PATH');
  }

  return {
    teamId,
    keyId,
    privateKeyPath: path.resolve(privateKeyPath)
  };
}

/**
 * Token manager class for handling Apple Music tokens
 */
export class AppleMusicTokenManager {
  private config: AppleMusicConfig;
  private currentToken: string | null = null;
  private tokenGeneratedAt: number = 0;

  constructor(config: AppleMusicConfig) {
    this.config = config;
  }

  /**
   * Gets a valid token, generating a new one if needed
   * @returns Promise<string> - Valid Apple Music token
   */
  async getValidToken(): Promise<string> {
    if (this.currentToken && this.isTokenValid()) {
      return this.currentToken;
    }

    // Generate new token
    this.currentToken = generateAppleMusicToken(this.config);
    this.tokenGeneratedAt = Date.now();

    return this.currentToken;
  }

  /**
   * Checks if current token is still valid
   * @returns boolean
   */
  private isTokenValid(): boolean {
    if (!this.currentToken) {
      return false;
    }

    return validateAppleMusicToken(this.currentToken);
  }

  /**
   * Forces generation of a new token
   * @returns string - New Apple Music token
   */
  refreshToken(): string {
    this.currentToken = generateAppleMusicToken(this.config);
    this.tokenGeneratedAt = Date.now();
    return this.currentToken;
  }

  /**
   * Gets token expiration info
   * @returns object with expiration details
   */
  getTokenInfo(): { token: string | null; generatedAt: number; isValid: boolean } {
    return {
      token: this.currentToken,
      generatedAt: this.tokenGeneratedAt,
      isValid: this.isTokenValid()
    };
  }
}

// Example usage functions
export function createTokenManager(): AppleMusicTokenManager {
  const config = createConfigFromEnv();
  return new AppleMusicTokenManager(config);
}

// For backwards compatibility with the original function
export function generateAppleMusicTokenLegacy(): string {
  const config = createConfigFromEnv();
  return generateAppleMusicToken(config);
}

// Example Express.js route handler
export async function tokenEndpointHandler(req: any, res: any): Promise<void> {
  try {
    const tokenManager = createTokenManager();
    const token = await tokenManager.getValidToken();
    
    res.json({
      success: true,
      token,
      expiresIn: '6 months',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in token endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Apple Music token'
    });
  }
}

// Type exports for use in other files
export type { AppleMusicConfig, AppleMusicTokenPayload };

// Example usage:
/*
// Using environment variables
const tokenManager = createTokenManager();
const token = await tokenManager.getValidToken();

// Using direct configuration
const config: AppleMusicConfig = {
  teamId: 'YOUR_TEAM_ID',
  keyId: 'YOUR_KEY_ID',
  privateKeyPath: './AuthKey_XXXXXXXXXX.p8'
};
const token = generateAppleMusicToken(config);
*/