import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const createWinstonConfig = () => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logFormat = process.env.LOG_FORMAT || 'json';

  const formats = [
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  ];

  if (logFormat === 'json') {
    formats.push(winston.format.json());
  } else {
    formats.push(
      winston.format.printf(({ level, message, timestamp, metadata }) => {
        let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
        if (Object.keys(metadata).length > 0) {
          log += ` ${JSON.stringify(metadata)}`;
        }
        return log;
      }),
    );
  }

  const transports: winston.transport[] = [];

  // Console transport
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    );
  }

  // File transports
  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
      }),
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
      }),
    );
  }

  return {
    level: logLevel,
    format: winston.format.combine(...formats),
    transports,
    exitOnError: false,
  };
};

export const createLogger = (context: string) => {
  return winston.createLogger({
    ...createWinstonConfig(),
    defaultMeta: { context },
  });
};