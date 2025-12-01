/**
 * Validates the presence of required environment variables.
 * Throws an error if any required variable is missing.
 * @param requiredVars An array of strings representing the names of required environment variables.
 */
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missingVars: string[] = [];

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}
