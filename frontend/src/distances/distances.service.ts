import { logger } from '../libs/logger';

export interface Query {
	sourceAddress: string;
	destinationAddress: string;
	distanceInMiles: string;
	timestamp: string;
}

export interface CalculationResult {
	sourceAddress: string;
	destinationAddress: string;
	distanceInMiles: string;
}

export class DistancesService {
	private apiUrl = 'http://localhost:3699';

	// Sanitize input
	private sanitizeInput(input: string): string {
		logger.debug('Sanitizing input', {
			input: input?.substring(0, 10) + '...',
		});

		if (!input || typeof input !== 'string') return '';

		// Remove dangerous characters and trim
		const sanitized = input.replace(/[<>{}]/g, '').trim();

		if (sanitized !== input) {
			logger.warn('Potentially dangerous input sanitized', {
				original: input?.substring(0, 20) + '...',
				sanitized: sanitized?.substring(0, 20) + '...',
			});
		}

		return sanitized;
	}

	public async fetchQueries(): Promise<Query[]> {
		logger.info('Fetching historical queries');
		try {
			const response = await fetch(`${this.apiUrl}/history`);
			if (!response.ok) {
				const errorText = await response.text();
				logger.error('Failed to fetch queries', {
					status: response.status,
					statusText: response.statusText,
					error: errorText,
				});
				throw new Error('Failed to fetch queries');
			}

			const queries = await response.json();
			logger.debug('Queries fetched successfully', {
				count: queries.length,
			});
			return queries;
		} catch (error) {
			logger.error('Error fetching queries', error);
			return [];
		}
	}

	public async calculateDistance(
		sourceAddress: string,
		destinationAddress: string
	): Promise<CalculationResult> {
		logger.info('Calculating distance', {
			sourceAddress: sourceAddress?.substring(0, 20) + '...',
			destinationAddress: destinationAddress?.substring(0, 20) + '...',
		});

		// Sanitize inputs before sending to server
		const sanitizedSource = this.sanitizeInput(sourceAddress);
		const sanitizedDest = this.sanitizeInput(destinationAddress);

		if (!sanitizedSource || !sanitizedDest) {
			logger.warn('Invalid address input detected', {
				sourceValid: !!sanitizedSource,
				destValid: !!sanitizedDest,
			});
			throw new Error('Invalid address input');
		}

		try {
			logger.debug('Sending calculation request to server');
			const response = await fetch(`${this.apiUrl}/calculate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sourceAddress: sanitizedSource,
					destinationAddress: sanitizedDest,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				logger.error('Server returned error', {
					status: response.status,
					error: errorData.error,
				});
				throw new Error(
					errorData.error || 'Failed to calculate distance'
				);
			}

			const result = await response.json();
			logger.info('Distance calculation successful', {
				distanceInMiles: result.distanceInMiles,
			});
			return result;
		} catch (error) {
			logger.error('Error during distance calculation', error);
			throw error;
		}
	}
}
