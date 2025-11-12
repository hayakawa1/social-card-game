/**
 * Client-side logger for frontend error tracking
 */

export enum ClientLogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface ClientLogEntry {
  level: ClientLogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userAgent?: string;
  url?: string;
}

class ClientLogger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getBrowserInfo() {
    if (typeof window === 'undefined') return {};

    return {
      userAgent: window.navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private formatLog(entry: ClientLogEntry): string {
    const { level, message, timestamp, context } = entry;

    let logMessage = `[${timestamp}] [CLIENT] [${level}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      logMessage += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    return logMessage;
  }

  private async sendToServer(entry: ClientLogEntry): Promise<void> {
    // In production, send errors to server for logging
    if (!this.isDevelopment) {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        // Failed to send to server, just log to console
        console.error('Failed to send log to server:', error);
      }
    }
  }

  private log(entry: ClientLogEntry): void {
    const formattedLog = this.formatLog(entry);

    switch (entry.level) {
      case ClientLogLevel.ERROR:
        console.error(formattedLog);
        this.sendToServer(entry);
        break;
      case ClientLogLevel.WARN:
        console.warn(formattedLog);
        break;
      case ClientLogLevel.INFO:
        console.info(formattedLog);
        break;
      case ClientLogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({
      level: ClientLogLevel.ERROR,
      message,
      timestamp: this.formatTimestamp(),
      context: { ...context, ...this.getBrowserInfo() },
      error,
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log({
      level: ClientLogLevel.WARN,
      message,
      timestamp: this.formatTimestamp(),
      context,
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({
      level: ClientLogLevel.INFO,
      message,
      timestamp: this.formatTimestamp(),
      context,
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: ClientLogLevel.DEBUG,
      message,
      timestamp: this.formatTimestamp(),
      context,
    });
  }

  // API call logging
  apiCall(method: string, url: string, status?: number): void {
    const message = status
      ? `API Call: ${method} ${url} - ${status}`
      : `API Call: ${method} ${url}`;

    if (status && status >= 400) {
      this.warn(message);
    } else {
      this.debug(message);
    }
  }

  // User action logging
  userAction(action: string, details?: Record<string, any>): void {
    this.info(`User Action: ${action}`, details);
  }
}

// Export singleton instance
export const clientLogger = new ClientLogger();

// Setup global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    clientLogger.error(
      'Uncaught Error',
      event.error,
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    clientLogger.error(
      'Unhandled Promise Rejection',
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        reason: String(event.reason),
      }
    );
  });
}
