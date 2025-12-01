import { Application } from "express";
declare class App {
    app: Application;
    port: string | number;
    basePath: string;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    initialize(): Promise<void>;
    listen(): void;
}
export default App;
//# sourceMappingURL=app.d.ts.map