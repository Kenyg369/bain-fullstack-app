declare module 'cors';
declare module 'mongodb';

declare module 'express' {
	export default function createExpress(): Express;

	interface Express {
		use: any;
		get: any;
		post: any;
		listen: any;
	}

	export const json: () => any;

	export interface Request {
		body: any;
		params: any;
		query: any;
	}

	export interface Response {
		status(code: number): Response;
		send(body: any): void;
		json(body: any): void;
	}
}
