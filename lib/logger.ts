/**
 * Logger utility for tracking errors and debugging
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error, userId, requestId } = entry;

    let logMessage = `[${timestamp}] [${level}]`;

    if (requestId) logMessage += ` [Request: ${requestId}]`;
    if (userId) logMessage += ` [User: ${userId}]`;

    logMessage += ` ${message}`;

    if (context && Object.keys(context).length > 0) {
      logMessage += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      logMessage += `\n  Error: ${error.message}`;
      if (error.stack) {
        logMessage += `\n  Stack: ${error.stack}`;
      }
    }

    return logMessage;
  }

  private log(entry: LogEntry): void {
    const formattedLog = this.formatLog(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      timestamp: this.formatTimestamp(),
      context,
      error,
      userId,
      requestId,
    });
  }

  warn(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      level: LogLevel.WARN,
      message,
      timestamp: this.formatTimestamp(),
      context,
      userId,
      requestId,
    });
  }

  info(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      level: LogLevel.INFO,
      message,
      timestamp: this.formatTimestamp(),
      context,
      userId,
      requestId,
    });
  }

  debug(
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      timestamp: this.formatTimestamp(),
      context,
      userId,
      requestId,
    });
  }

  // API request logging
  apiRequest(
    method: string,
    path: string,
    userId?: string,
    requestId?: string
  ): void {
    this.info(`API Request: ${method} ${path}`, undefined, userId, requestId);
  }

  apiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string
  ): void {
    const message = `API Response: ${method} ${path} - ${statusCode} (${duration}ms)`;

    if (statusCode >= 500) {
      this.error(message, undefined, undefined, userId, requestId);
    } else if (statusCode >= 400) {
      this.warn(message, undefined, userId, requestId);
    } else {
      this.info(message, undefined, userId, requestId);
    }
  }

  // Database operation logging
  dbQuery(query: string, duration: number, requestId?: string): void {
    this.debug(`DB Query: ${query} (${duration}ms)`, undefined, undefined, requestId);
  }

  dbError(query: string, error: Error, requestId?: string): void {
    this.error(`DB Error: ${query}`, error, undefined, undefined, requestId);
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function to generate request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
