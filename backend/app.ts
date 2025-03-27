import express, { Request, Response } from 'express';
import cors from 'cors';
import { registerDistancesController } from './distances/distances.controller';
import { logger } from './libs/logger';

logger.info('Starting Distance Calculator API');

const app = express();
app.use(express.json());
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
	const start = Date.now();
	logger.debug(`${req.method} ${req.url} started`);

	// Once the request is processed
	res.on('finish', () => {
		const duration = Date.now() - start;
		logger.info(
			`${req.method} ${req.url} completed in ${duration}ms with status ${res.statusCode}`
		);
	});

	next();
});

// Register controller
registerDistancesController(app);

app.get('/', (req: Request, res: Response) => {
	logger.debug('Root endpoint called');
	res.send('Distance Calculator API');
});

// Production server start
if (process.env?.NODE_ENV === 'production') {
	const port = 3699;
	app.listen(port);
	logger.info(`Server listening on http://localhost:${port}/`);
} else {
	logger.info('Server running in development mode');
}

export const viteNodeApp = app;
