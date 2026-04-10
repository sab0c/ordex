type EnvVariables = {
  PORT?: string;
  DATABASE_URL?: string;
  DB_SYNCHRONIZE?: string;
  CORS_ORIGIN?: string;
  THROTTLE_TTL?: string;
  THROTTLE_LIMIT?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
};

function ensureBoolean(value: string | undefined, key: string): void {
  if (value === undefined) {
    return;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (!['true', 'false', '1', '0'].includes(normalizedValue)) {
    throw new Error(`Environment variable ${key} must be a valid boolean.`);
  }
}

function ensureRequired(value: string | undefined, key: string): string {
  if (value === undefined || value.trim().length === 0) {
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
  ensureRequired(config.ADMIN_USERNAME, 'ADMIN_USERNAME');
  ensureRequired(config.ADMIN_PASSWORD, 'ADMIN_PASSWORD');

  ensureRequired(config.JWT_EXPIRES_IN, 'JWT_EXPIRES_IN');
  ensureBoolean(config.DB_SYNCHRONIZE, 'DB_SYNCHRONIZE');
  ensureNumber(config.THROTTLE_TTL, 'THROTTLE_TTL');
  ensureNumber(config.THROTTLE_LIMIT, 'THROTTLE_LIMIT');

  return config;
}
