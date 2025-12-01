// lib/amazon-logger.ts

import { AmazonAPIError, AmazonAPIErrorType } from './types/amazon';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

export class AmazonLogger {
  private static instance: AmazonLogger;
  private logs: LogEntry[] = []; // In-memory log for demonstration

  private constructor() {}

  public static getInstance(): AmazonLogger {
    if (!AmazonLogger.instance) {
      AmazonLogger.instance = new AmazonLogger();
    }
    return AmazonLogger.instance;
  }

  private log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    this.logs.push(entry);
    // In a real application, this would write to a file, a logging service (e.g., DataDog, Sentry), or console.
    // For now, we'll just console log.
    switch (level) {
      case 'info':
        console.info(`[AmazonPAAPI][INFO] ${message}`, context || '');
        break;
      case 'warn':
        console.warn(`[AmazonPAAPI][WARN] ${message}`, context || '');
        break;
      case 'error':
        console.error(`[AmazonPAAPI][ERROR] ${message}`, context || '');
        break;
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  public error(message: string, error: any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: error instanceof AmazonAPIError ? error.type : 'UnknownError',
      statusCode: error.response?.status,
    };
    this.log('error', message, errorContext);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const amazonLogger = AmazonLogger.getInstance();