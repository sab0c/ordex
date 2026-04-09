export function parseBoolean(
  value: string | undefined,
  defaultValue: boolean = false,
): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === 'true' || normalizedValue === '1') {
    return true;
  }

  if (normalizedValue === 'false' || normalizedValue === '0') {
    return false;
  }

  return defaultValue;
}

export function parseNumber(
  value: string | undefined,
  defaultValue: number = 0,
): number {
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
}

export function parseOrigins(
  value: string | undefined,
  defaultValue: string[] = [],
): string[] {
  if (!value) {
    return defaultValue;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
