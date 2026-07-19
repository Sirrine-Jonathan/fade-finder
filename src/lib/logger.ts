import morgan from 'morgan';

/**
 * Server-side logging telemetry helper for API routes and middleware.
 * Uses morgan formatting for structured HTTP telemetry.
 */
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, meta?: Record<string, any>) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  http: (method: string, path: string, status: number, durationMs: number) => {
    const timestamp = new Date().toISOString();
    console.log(`[HTTP] [${timestamp}] ${method} ${path} ${status} - ${durationMs.toFixed(2)}ms`);
  },
};

export default logger;
