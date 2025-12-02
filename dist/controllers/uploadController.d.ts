import { Response, NextFunction } from "express";
declare class UploadController {
    uploadImage: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
    deleteImage: (req: import("express").Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const uploadController: UploadController;
export default uploadController;
//# sourceMappingURL=uploadController.d.ts.map