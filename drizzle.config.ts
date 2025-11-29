import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
const dbCredentials: any = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'rusdi_barber_db',
};

// Only include password if it's defined
if (dbPassword !== undefined && dbPassword !== '') {
  dbCredentials.password = dbPassword;
}

export default defineConfig({
  schema: './src/models/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials,
  verbose: true,
  strict: true,
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
});
