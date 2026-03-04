/**
 * Converts a Drizzle row (camelCase) to snake_case for API responses.
 * This ensures the frontend Experience type (snake_case) matches what the API returns.
 */
export function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

export function mapExperience(row: Record<string, unknown>) {
  return toSnakeCase(row);
}

export function mapExperiences(rows: Record<string, unknown>[]) {
  return rows.map(mapExperience);
}
