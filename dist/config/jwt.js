"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTConfig {
    constructor() {
        this.secret = process.env.JWT_SECRET || "fallback_secret_key";
        this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        if (!process.env.JWT_SECRET) {
            console.warn("⚠️ JWT_SECRET not set in environment variables");
        }
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
            issuer: "rusdi-barber-api",
            audience: "rusdi-barber-client",
        });
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secret, {
                issuer: "rusdi-barber-api",
                audience: "rusdi-barber-client",
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("Invalid token");
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error("Token expired");
            }
            throw new Error("Token verification failed");
        }
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, {
            expiresIn: "30d",
            issuer: "rusdi-barber-api",
            audience: "rusdi-barber-client",
        });
    }
    extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return null;
        }
        return parts[1] || null;
    }
    decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.default = new JWTConfig();
//# sourceMappingURL=jwt.js.map