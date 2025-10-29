import mysql from "mysql2/promise";
export declare const pool: mysql.Pool;
export declare const db: import("drizzle-orm/mysql2").MySql2Database<Record<string, never>> & {
    $client: mysql.Pool;
};
export declare const testConnection: () => Promise<boolean>;
export declare const closeConnection: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map