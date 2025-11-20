import jwt, { Secret, SignOptions } from "jsonwebtoken";

const ACCESS_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// These must remain strings like "15m", "7d"
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "7d";

interface JWTPayload {
  id: string | number;
  email?: string;
  role?: string;
  [key: string]: any;
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, ACCESS_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
}
