import { Request } from "express";
export interface JWTPayload {
    userId: string;
    email: string;
    role: "admin" | "manager" | "stylist" | "customer";
    stylistId?: string;
    branchId?: string;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
    checkOwnership?: boolean;
}
declare class JWTConfig {
    private readonly secret;
    private readonly expiresIn;
    constructor();
    generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string;
    verifyToken(token: string): JWTPayload;
    generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): string;
    extractTokenFromHeader(authHeader?: string): string | null;
    decodeToken(token: string): JWTPayload | null;
}
declare const _default: JWTConfig;
export default _default;
//# sourceMappingURL=jwt.d.ts.map