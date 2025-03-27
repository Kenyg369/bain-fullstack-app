import { IncomingMessage, ServerResponse } from 'http';
import { DistancesService } from './distances.service';
import { logger } from '../libs/logger';

type Request = IncomingMessage & { body: any };
type Response = ServerResponse & {
	json: (data: any) => void;
	status: (code: number) => Response;
	end: (data?: any) => void;
};

// Input validation functions
function validateAddress(address: string): {
	valid: boolean;
	message?: string;
} {
	if (!address || typeof address !== 'string') {
		return { valid: false, message: 'Address must be a non-empty string' };
	}

	// Trim and check length
	address = address.trim();
	if (address.length < 3) {
		return { valid: false, message: 'Address is too short' };
	}

	if (address.length > 200) {
		return { valid: false, message: 'Address is too long' };
	}

	// Block potentially dangerous characters and patterns
	const dangerousPattern = /[<>{}]/;
	if (dangerousPattern.test(address)) {
		return { valid: false, message: 'Address contains invalid characters' };
	}

	return { valid: true };
}

export function registerDistancesController(app: any) {
	logger.info('Registering distances controller endpoints');

	// Calculate endpoint
	app.post('/calculate', async (req: Request, res: Response) => {
		try {
			logger.debug('Calculate distance request received', {
				body: req.body,
			});
			const { sourceAddress, destinationAddress } = req.body;

			// Validate source address
			const sourceValidation = validateAddress(sourceAddress);
			if (!sourceValidation.valid) {
				logger.warn('Invalid source address', {
					address: sourceAddress,
					message: sourceValidation.message,
				});
				return res.status(400).json({
					error: `Invalid source address: ${sourceValidation.message}`,
				});
			}

			// Validate destination address
			const destValidation = validateAddress(destinationAddress);
			if (!destValidation.valid) {
				logger.warn('Invalid destination address', {
					address: destinationAddress,
					message: destValidation.message,
				});
				return res.status(400).json({
					error: `Invalid destination address: ${destValidation.message}`,
				});
			}

			// Get coordinates for source address using Nominatim API
			logger.debug('Starting distance calculation', {
				sourceAddress,
				destinationAddress,
			});
			const service = new DistancesService();
			const result = await service.calculateDistance(
				sourceAddress.trim(),
				destinationAddress.trim()
			);

			if (result.status === 'ERROR') {
				logger.warn('Distance calculation failed', {
					status: result.status,
					message: result.message,
					statusCode: result.statusCode,
				});
				return res
					.status(result.statusCode)
					.json({ error: result.message });
			} else {
				logger.info('Distance calculated successfully', {
					sourceAddress,
					destinationAddress,
					distanceInMiles: result.distanceInMiles,
				});
				return res.json({
					sourceAddress,
					destinationAddress,
					distanceInMiles: result.distanceInMiles,
				});
			}
		} catch (error) {
			logger.error('Error calculating distance', error);
			return res
				.status(500)
				.json({ error: 'Failed to calculate distance' });
		}
	});

	// History endpoint
	app.get('/history', async (req: Request, res: Response) => {
		try {
			logger.debug('History request received');
			const service = new DistancesService();
			const queries = await service.getHistory();
			logger.info('History fetched successfully', {
				count: queries.length,
			});
			res.json(queries);
		} catch (error) {
			logger.error('Error retrieving history', error);
			res.status(500).json({ error: 'Failed to retrieve history' });
		}
	});
}
