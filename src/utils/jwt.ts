import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Decoded token structure
 */
export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

/**
 * Generates a JWT access token
 * @param payload - User data to encode
 * @returns JWT token string
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Generates a refresh token with longer expiry
 * @param payload - User data to encode
 * @returns JWT refresh token string
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "30d",
  });
}

/**
 * Verifies and decodes a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, config.jwtSecret) as DecodedToken;
  } catch {
    return null;
  }
}

/**
 * Extracts token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
