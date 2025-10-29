import jwt from "jsonwebtoken";
import { Request } from "express";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "manager" | "stylist" | "customer";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

class JWTConfig {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "fallback_secret_key";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    if (!process.env.JWT_SECRET) {
      console.warn("⚠️ JWT_SECRET not set in environment variables");
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
      issuer: "rusdi-barber-api",
      audience: "rusdi-barber-client",
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: "rusdi-barber-api",
        audience: "rusdi-barber-client",
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      }
      throw new Error("Token verification failed");
    }
  }

  /**
   * Generate refresh token (longer expiration)
   */
  generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: "30d",
      issuer: "rusdi-barber-api",
      audience: "rusdi-barber-client",
    } as jwt.SignOptions);
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1] || null;
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}

export default new JWTConfig();
