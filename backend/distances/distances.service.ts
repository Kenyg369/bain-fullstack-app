import { getMongoClient } from '../libs/db';
import { Status } from '../libs/constants';
import { logger } from '../libs/logger';

export interface DistanceResult {
	status: string;
	statusCode: number;
	message: string;
	distanceInMiles?: number;
}

export interface DistanceRecord {
	sourceAddress: string;
	destinationAddress: string;
	distanceInMiles: number;
	timestamp: number;
}

export class DistancesService {
	// Calculate distance between two points using Euclidean distance
	private calculateEuclideanDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		logger.debug('Calculating Euclidean distance', {
			lat1,
			lon1,
			lat2,
			lon2,
		});

		// Convert latitude and longitude from degrees to radians
		const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

		// Earth radius in miles
		const earthRadius = 3958.8; // miles (6371 km)

		const lat1Rad = toRadians(lat1);
		const lon1Rad = toRadians(lon1);
		const lat2Rad = toRadians(lat2);
		const lon2Rad = toRadians(lon2);

		// Haversine formula
		const dLat = lat2Rad - lat1Rad;
		const dLon = lon2Rad - lon1Rad;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1Rad) *
				Math.cos(lat2Rad) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = earthRadius * c;

		logger.debug('Distance calculated', { distance });
		return distance;
	}

	public async calculateDistance(
		sourceAddress: string,
		destinationAddress: string
	): Promise<DistanceResult> {
		logger.info('Calculating distance between addresses', {
			sourceAddress,
			destinationAddress,
		});

		const result: DistanceResult = {
			status: Status.OK,
			statusCode: 200,
			message: 'Distance calculated successfully',
			distanceInMiles: undefined,
		};

		try {
			logger.debug('Fetching coordinates for source address');
			const sourceResponse = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
					sourceAddress
				)}&format=json&limit=1`,
				{
					headers: {
						'User-Agent': 'DistanceCalculatorApp/1.0',
					},
				}
			);
			const sourceData = await sourceResponse.json();

			if (!sourceData.length) {
				logger.warn('Source address not found', { sourceAddress });
				return {
					status: Status.ERROR,
					statusCode: 404,
					message: 'Source address not found',
					distanceInMiles: undefined,
				};
			}

			// Add delay between requests to respect Nominatim usage policy
			logger.debug('Adding delay before second API call');
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Get coordinates for destination address using Nominatim API
			logger.debug('Fetching coordinates for destination address');
			const destResponse = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
					destinationAddress
				)}&format=json&limit=1`,
				{
					headers: {
						'User-Agent': 'DistanceCalculatorApp/1.0',
					},
				}
			);
			const destData = await destResponse.json();

			if (!destData.length) {
				logger.warn('Destination address not found', {
					destinationAddress,
				});
				return {
					status: Status.ERROR,
					statusCode: 404,
					message: 'Destination address not found',
					distanceInMiles: undefined,
				};
			}

			const sourceLat = parseFloat(sourceData[0].lat);
			const sourceLon = parseFloat(sourceData[0].lon);
			const destLat = parseFloat(destData[0].lat);
			const destLon = parseFloat(destData[0].lon);

			logger.debug('Coordinates retrieved successfully', {
				sourceLat,
				sourceLon,
				destLat,
				destLon,
			});

			// Calculate distance in miles
			const distanceInMiles = this.calculateEuclideanDistance(
				sourceLat,
				sourceLon,
				destLat,
				destLon
			);

			// Save query to MongoDB
			logger.debug('Saving query to database');
			try {
				const db = (await getMongoClient()).db('distanceCalculatorDB');
				await db.collection('queries').insertOne({
					sourceAddress,
					destinationAddress,
					distanceInMiles,
					timestamp: new Date(),
				});
				logger.debug('Query saved to database');
			} catch (dbError) {
				logger.error('Failed to save query to database', dbError);
				// Continue even if saving to DB fails
			}

			result.distanceInMiles = distanceInMiles;
			logger.info('Distance calculation completed successfully', {
				distanceInMiles,
			});
			return result;
		} catch (error) {
			logger.error('Error in calculateDistance', error);
			return {
				status: Status.ERROR,
				statusCode: 500,
				message: 'Failed to calculate distance',
				distanceInMiles: undefined,
			};
		}
	}

	public async getHistory(): Promise<DistanceRecord[]> {
		logger.info('Fetching distance calculation history');
		try {
			const db = (await getMongoClient()).db('distanceCalculatorDB');
			const queries = await db
				.collection('queries')
				.find({})
				.sort({ timestamp: -1 })
				.toArray();

			logger.debug('History fetched successfully', {
				count: queries.length,
			});
			return queries as unknown as DistanceRecord[];
		} catch (error) {
			logger.error('Error fetching history', error);
			throw error;
		}
	}
}
