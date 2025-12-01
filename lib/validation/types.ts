export interface LinkValidationResult {
  url: string;
  isValid: boolean;
  statusCode: number;
  redirectUrl?: string;
  error?: string;
  lastChecked: string;
}
