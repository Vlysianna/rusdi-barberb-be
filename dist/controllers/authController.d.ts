import { Response, NextFunction } from "express";
declare class AuthController {
    register: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getProfile: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    changePassword: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    requestPasswordReset: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    verifyEmail: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deactivateAccount: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    activateAccount: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    checkAuth: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=authController.d.ts.map