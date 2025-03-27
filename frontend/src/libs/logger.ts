/* Frontend Logger Utility */

enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

class Logger {
	private level: LogLevel;
	private isEnabled: boolean;
	private appName: string = 'DistanceCalculator';

	constructor() {
		// Default to INFO in production, DEBUG in development
		this.level = import.meta.env.PROD ? LogLevel.INFO : LogLevel.DEBUG;
		this.isEnabled = true;

		// Check if logging is enabled in localStorage
		try {
			const storedLogState = localStorage.getItem('app_logging_enabled');
			if (storedLogState !== null) {
				this.isEnabled = storedLogState === 'true';
			}

			const storedLogLevel = localStorage.getItem('app_log_level');
			if (storedLogLevel !== null) {
				this.level = parseInt(storedLogLevel, 10) as LogLevel;
			}
		} catch (e) {
			// Ignore localStorage errors
		}
	}

	private getTimestamp(): string {
		return new Date().toISOString();
	}

	private formatMessage(level: string, message: string, data?: any): string {
		return `[${this.appName}] [${level}] ${message}`;
	}

	public setLevel(level: LogLevel): void {
		this.level = level;
		try {
			localStorage.setItem('app_log_level', level.toString());
		} catch (e) {
			// Ignore localStorage errors
		}
	}

	public enableLogging(enabled: boolean): void {
		this.isEnabled = enabled;
		try {
			localStorage.setItem('app_logging_enabled', enabled.toString());
		} catch (e) {
			// Ignore localStorage errors
		}
	}

	public debug(message: string, data?: any): void {
		if (!this.isEnabled || this.level > LogLevel.DEBUG) return;

		const formattedMessage = this.formatMessage('DEBUG', message, data);
		console.debug(formattedMessage, data !== undefined ? data : '');
	}

	public info(message: string, data?: any): void {
		if (!this.isEnabled || this.level > LogLevel.INFO) return;

		const formattedMessage = this.formatMessage('INFO', message, data);
		console.info(formattedMessage, data !== undefined ? data : '');
	}

	public warn(message: string, data?: any): void {
		if (!this.isEnabled || this.level > LogLevel.WARN) return;

		const formattedMessage = this.formatMessage('WARN', message, data);
		console.warn(formattedMessage, data !== undefined ? data : '');
	}

	public error(message: string, error?: any): void {
		if (!this.isEnabled || this.level > LogLevel.ERROR) return;

		const formattedMessage = this.formatMessage('ERROR', message, error);
		console.error(formattedMessage, error !== undefined ? error : '');
	}
}

// Export singleton instance
export const logger = new Logger();
