import { describe, it, expect } from 'vitest';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should be defined', () => {
		expect(Page).toBeDefined();
	});
});
