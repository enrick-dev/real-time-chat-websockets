import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string) {
    this.printLog('log', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printLog('error', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.printLog('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.printLog('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.printLog('verbose', message, context);
  }

  private printLog(level: LogLevel, message: any, context?: string, trace?: string) {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context || 'Application';
    
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: logContext,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...(trace && { trace }),
    };

    const colors = {
      log: '\x1b[32m',    // Verde
      error: '\x1b[31m',  // Vermelho
      warn: '\x1b[33m',   // Amarelo
      debug: '\x1b[36m',  // Ciano
      verbose: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${logEntry.timestamp}] ${logEntry.level} [${logEntry.context}] ${logEntry.message}${reset}`);
    
    if (trace) {
      console.log(`${color}${trace}${reset}`);
    }
  }
}
