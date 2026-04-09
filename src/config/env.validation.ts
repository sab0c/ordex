type EnvVariables = {
  PORT?: string;
  DATABASE_URL?: string;
  DB_SYNCHRONIZE?: string;
  CORS_ORIGIN?: string;
  THROTTLE_TTL?: string;
  THROTTLE_LIMIT?: string;
  JWT_SECRET?: string;
  AUTH_USERNAME?: string;
  AUTH_PASSWORD?: string;
};

function ensureRequired(value: string | undefined, key: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Environment variable ${key} is required.`);
  }

  return value;
}

function ensureNumber(value: string | undefined, key: string): void {
  if (value === undefined) {
    return;
  }

  if (Number.isNaN(Number(value))) {
    throw new Error(`Environment variable ${key} must be a valid number.`);
  }
}

export function validateEnv(config: EnvVariables): EnvVariables {
  ensureRequired(config.PORT, 'PORT');
  ensureRequired(config.DATABASE_URL, 'DATABASE_URL');
  ensureRequired(config.JWT_SECRET, 'JWT_SECRET');
  ensureRequired(config.AUTH_USERNAME, 'AUTH_USERNAME');
  ensureRequired(config.AUTH_PASSWORD, 'AUTH_PASSWORD');

  ensureNumber(config.THROTTLE_TTL, 'THROTTLE_TTL');
  ensureNumber(config.THROTTLE_LIMIT, 'THROTTLE_LIMIT');

  return config;
}
