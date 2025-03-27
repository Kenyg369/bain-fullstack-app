import fs from 'fs';
import path from 'path';

// Log levels
enum LogLevel {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
}

class Logger {
	private logDir: string;
	private logFile: string;
	private debugMode: boolean;

	constructor() {
		this.logDir = path.join(process.cwd(), 'logs');
		this.logFile = path.join(this.logDir, 'app.log');
		this.debugMode = process.env.NODE_ENV !== 'production';

		// Create logs directory if it doesn't exist
		if (!fs.existsSync(this.logDir)) {
			fs.mkdirSync(this.logDir, { recursive: true });
		}
	}

	private formatMessage(
		level: LogLevel,
		message: string,
		data?: any
	): string {
		const timestamp = new Date().toISOString();
		let logMessage = `[${timestamp}] [${level}] ${message}`;

		if (data) {
			try {
				logMessage += ` - ${
					typeof data === 'object' ? JSON.stringify(data) : data
				}`;
			} catch (error) {
				logMessage += ` - [Circular data structure]`;
			}
		}

		return logMessage;
	}

	private write(level: LogLevel, message: string, data?: any): void {
		const logMessage = this.formatMessage(level, message, data);

		// Always console log in debug mode
		if (this.debugMode || level === LogLevel.ERROR) {
			console.log(logMessage);
		}

		// Write to file
		fs.appendFileSync(this.logFile, logMessage + '\n');
	}

	public debug(message: string, data?: any): void {
		if (this.debugMode) {
			this.write(LogLevel.DEBUG, message, data);
		}
	}

	public info(message: string, data?: any): void {
		this.write(LogLevel.INFO, message, data);
	}

	public warn(message: string, data?: any): void {
		this.write(LogLevel.WARN, message, data);
	}

	public error(message: string, error?: any): void {
		let errorData = error;

		// Handle Error objects specially
		if (error instanceof Error) {
			errorData = {
				message: error.message,
				stack: error.stack,
				name: error.name,
			};
		}

		this.write(LogLevel.ERROR, message, errorData);
	}
}

// Export singleton instance
export const logger = new Logger();
