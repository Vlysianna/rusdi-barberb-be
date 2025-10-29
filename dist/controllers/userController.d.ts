import { Response, NextFunction } from "express";
declare class UserController {
    getUsers: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    createUser: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    updateUser: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteUser: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    uploadAvatar: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getUserStats: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    bulkUpdateUsers: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    searchUsers: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    getUserActivity: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    exportUsers: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=userController.d.ts.map