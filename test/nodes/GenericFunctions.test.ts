import { describe, it, expect } from 'vitest';
import { buildSapiPath } from '../../nodes/HybridForms/GenericFunctions';

describe('buildSapiPath', () => {
	it('should build path without formId', () => {
		const path = buildSapiPath('my-client', 'form-def-123');
		expect(path).toBe('/api/app/my-client/formdefinitions/form-def-123/forms/sapi');
	});

	it('should build path with formId', () => {
		const path = buildSapiPath('my-client', 'form-def-123', 'form-456');
		expect(path).toBe('/api/app/my-client/formdefinitions/form-def-123/forms/sapi/form-456');
	});

	it('should encode special characters in path segments', () => {
		const path = buildSapiPath('client with spaces', 'def/id', 'form?id');
		expect(path).toBe(
			'/api/app/client%20with%20spaces/formdefinitions/def%2Fid/forms/sapi/form%3Fid',
		);
	});
});
