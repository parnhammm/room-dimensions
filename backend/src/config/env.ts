import 'dotenv/config';

function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DB_HOST: requireEnv('DB_HOST', 'localhost'),
  DB_PORT: parseInt(requireEnv('DB_PORT', '3306'), 10),
  DB_USERNAME: requireEnv('DB_USERNAME', 'root'),
  DB_PASSWORD: requireEnv('DB_PASSWORD', 'password'),
  DB_DATABASE: requireEnv('DB_DATABASE', 'room_dimensions'),
  API_PORT: parseInt(requireEnv('API_PORT', '4000'), 10),
  LOG_LEVEL: requireEnv('LOG_LEVEL', 'info'),
  NODE_ENV: requireEnv('NODE_ENV', 'development'),
} as const;
