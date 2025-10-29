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
exports.closeConnection = exports.testConnection = exports.db = exports.pool = void 0;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "rusdi_barber_db",
    multipleStatements: true,
};
exports.pool = promise_1.default.createPool({
    ...connectionConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.db = (0, mysql2_1.drizzle)(exports.pool);
const testConnection = async () => {
    try {
        const connection = await exports.pool.getConnection();
        await connection.ping();
        connection.release();
        console.log("✅ Database connection successful");
        return true;
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        return false;
    }
};
exports.testConnection = testConnection;
const closeConnection = async () => {
    try {
        await exports.pool.end();
        console.log("📝 Database connection closed");
    }
    catch (error) {
        console.error("Error closing database connection:", error);
    }
};
exports.closeConnection = closeConnection;
//# sourceMappingURL=database.js.map