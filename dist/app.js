"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const stylists_1 = __importDefault(require("./routes/stylists"));
const services_1 = __importDefault(require("./routes/services"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const payments_1 = __importDefault(require("./routes/payments"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3000;
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        this.app.set("trust proxy", 1);
        const corsOptions = {
            origin: process.env.CORS_ORIGIN || ["http://localhost:8081", "http://localhost:5173"],
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: [
                "Origin",
                "X-Requested-With",
                "Content-Type",
                "Accept",
                "Authorization",
                "Cache-Control",
                "Pragma",
            ],
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        this.app.use((req, res, next) => {
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("X-XSS-Protection", "1; mode=block");
            res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            next();
        });
        if (process.env.NODE_ENV === "development") {
            this.app.use((req, res, next) => {
                console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
                next();
            });
        }
        this.app.get("/health", (req, res) => {
            res.status(200).json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
                version: process.env.npm_package_version || "1.0.0",
            });
        });
        this.app.get("/api/v1/health", (req, res) => {
            res.status(200).json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
                version: process.env.npm_package_version || "1.0.0",
            });
        });
        this.app.get("/", (req, res) => {
            res.json({
                name: "Rusdi Barber API",
                version: "1.0.0",
                description: "Barber shop booking and management system API",
                endpoints: {
                    health: "/health",
                    auth: "/api/v1/auth",
                    users: "/api/v1/users",
                    stylists: "/api/v1/stylists",
                    services: "/api/v1/services",
                    bookings: "/api/v1/bookings",
                    payments: "/api/v1/payments",
                    reviews: "/api/v1/reviews",
                    notifications: "/api/v1/notifications",
                    dashboard: "/api/v1/dashboard",
                },
                documentation: {
                    message: "API documentation will be available soon",
                    swagger: "/api/docs",
                },
            });
        });
    }
    initializeRoutes() {
        const apiPrefix = "/api/v1";
        this.app.use(`${apiPrefix}/auth`, auth_1.default);
        this.app.use(`${apiPrefix}/users`, users_1.default);
        this.app.use(`${apiPrefix}/stylists`, stylists_1.default);
        this.app.use(`${apiPrefix}/services`, services_1.default);
        this.app.use(`${apiPrefix}/bookings`, bookings_1.default);
        this.app.use(`${apiPrefix}/payments`, payments_1.default);
        this.app.use(`${apiPrefix}/dashboard`, dashboard_1.default);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.notFoundHandler);
        this.app.use(errorHandler_1.errorHandler);
    }
    async initialize() {
        try {
            const dbConnected = await (0, database_1.testConnection)();
            if (!dbConnected) {
                console.error("❌ Failed to connect to database");
                process.exit(1);
            }
            console.log("✅ Application initialized successfully");
        }
        catch (error) {
            console.error("❌ Failed to initialize application:", error);
            process.exit(1);
        }
    }
    listen() {
        const server = this.app.listen(this.port, () => {
            console.log(`🚀 Server running on port ${this.port}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`📖 API Documentation: http://localhost:${this.port}`);
            console.log(`❤️  Health Check: http://localhost:${this.port}/health`);
        });
        (0, errorHandler_1.gracefulShutdown)(server);
        server.on("error", (error) => {
            if (error.syscall !== "listen") {
                throw error;
            }
            const bind = typeof this.port === "string"
                ? "Pipe " + this.port
                : "Port " + this.port;
            switch (error.code) {
                case "EACCES":
                    console.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case "EADDRINUSE":
                    console.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map