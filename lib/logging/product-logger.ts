import { ProductError } from '../errors/product-errors';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: ProductError;
}

export interface LoggerConfig {
  minLevel?: LogLevel;
  includeTimestamp?: boolean;
  includeContext?: boolean;
  format?: 'json' | 'text';
  enabled?: boolean;
}

export class ProductLogger {
  private minLevel: LogLevel;
  private includeTimestamp: boolean;
  private includeContext: boolean;
  private format: 'json' | 'text';
  private enabled: boolean;

  constructor(config?: LoggerConfig) {
    this.minLevel = config?.minLevel || 'info';
    this.includeTimestamp = config?.includeTimestamp !== false;
    this.includeContext = config?.includeContext !== false;
    this.format = config?.format || 'json';
    this.enabled = config?.enabled !== false;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private formatLog(entry: LogEntry): string {
    if (this.format === 'text') {
      let text = `[${entry.level.toUpperCase()}] ${entry.message}`;
      if (this.includeTimestamp) {
        text = `${entry.timestamp} ${text}`;
      }
      if (entry.context && this.includeContext) {
        text += ` | Context: ${JSON.stringify(entry.context)}`;
      }
      if (entry.error) {
        text += ` | Error: ${entry.error.message} (Code: ${entry.error.code})`;
      }
      return text;
    } else {
      return JSON.stringify(entry);
    }
  }

  private log(level: LogLevel, message: string, context?: any, error?: ProductError): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.includeTimestamp ? new Date().toISOString() : '',
      level,
      message,
      ...(this.includeContext && context ? { context } : {}),
      ...(error ? { error } : {})
    };

    const formattedLog = this.formatLog(entry);

    // In a real implementation, this would write to a file, external service, etc.
    if (level === 'error' || level === 'warn') {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: ProductError, context?: any): void {
    this.log('error', message, context, error);
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  // Log performance metrics
  logPerformance(operation: string, duration: number, context?: any): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      operation,
      duration
    });
  }
}

// Singleton logger instance
export const productLogger = new ProductLogger({
  minLevel: 'info',
  includeTimestamp: true,
  includeContext: true,
  format: 'json',
  enabled: true
});

// Function to create contextual loggers
export function createLogger(context: string, config?: LoggerConfig): ProductLogger {
  const logger = new ProductLogger(config);

  // Override the log method to include context
  const originalLog = logger['log'].bind(logger);
  logger['log'] = (level: LogLevel, message: string, ctx?: any, error?: ProductError) => {
    return originalLog(level, message, { ...ctx, context }, error);
  };

  return logger;
}