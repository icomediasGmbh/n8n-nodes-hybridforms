import { describe, it, expect } from 'vitest';
import { HybridFormsApi } from '../../credentials/HybridFormsApi.credentials';
import { HybridFormsBasicAuthApi } from '../../credentials/HybridFormsBasicAuthApi.credentials';
import { HybridFormsOAuth2Api } from '../../credentials/HybridFormsOAuth2Api.credentials';

describe('HybridFormsOAuth2Api Credentials', () => {
	const creds = new HybridFormsOAuth2Api();

	it('should have correct credential name', () => {
		expect(creds.name).toBe('hybridFormsOAuth2Api');
		expect(creds.displayName).toBe('HybridForms OAuth2 API');
	});

	it('should extend oAuth2Api', () => {
		expect(creds.extends).toEqual(['oAuth2Api']);
	});

	it('should define serverUrl and client properties', () => {
		const propNames = creds.properties.map((p) => p.name);
		expect(propNames).toContain('serverUrl');
		expect(propNames).toContain('client');
	});

	it('should define OAuth2 URL properties', () => {
		const propNames = creds.properties.map((p) => p.name);
		expect(propNames).toContain('authUrl');
		expect(propNames).toContain('accessTokenUrl');
		expect(propNames).toContain('scope');
	});

	it('should use header-based authentication', () => {
		const authProp = creds.properties.find((p) => p.name === 'authentication');
		expect(authProp?.default).toBe('header');
	});
});

describe('HybridFormsApi Credentials (Bearer Token)', () => {
	const creds = new HybridFormsApi();

	it('should have correct credential name', () => {
		expect(creds.name).toBe('hybridFormsApi');
		expect(creds.displayName).toBe('HybridForms API (Bearer Token)');
	});

	it('should not extend oAuth2Api', () => {
		expect(creds).not.toHaveProperty('extends');
	});

	it('should define serverUrl, client, and token properties', () => {
		const propNames = creds.properties.map((p) => p.name);
		expect(propNames).toContain('serverUrl');
		expect(propNames).toContain('client');
		expect(propNames).toContain('token');
	});

	it('should mark token as password field', () => {
		const tokenProp = creds.properties.find((p) => p.name === 'token');
		expect(tokenProp?.typeOptions).toEqual({ password: true });
	});

	it('should use Bearer token in Authorization header', () => {
		expect(creds.authenticate).toEqual({
			type: 'generic',
			properties: {
				headers: {
					Authorization: '=Bearer {{$credentials?.token}}',
				},
			},
		});
	});
});

describe('HybridFormsBasicAuthApi Credentials', () => {
	const creds = new HybridFormsBasicAuthApi();

	it('should have correct credential name', () => {
		expect(creds.name).toBe('hybridFormsBasicAuthApi');
		expect(creds.displayName).toBe('HybridForms API (Basic Auth)');
	});

	it('should define serverUrl, client, username, and password properties', () => {
		const propNames = creds.properties.map((p) => p.name);
		expect(propNames).toContain('serverUrl');
		expect(propNames).toContain('client');
		expect(propNames).toContain('username');
		expect(propNames).toContain('password');
	});

	it('should mark password as password field', () => {
		const pwProp = creds.properties.find((p) => p.name === 'password');
		expect(pwProp?.typeOptions).toEqual({ password: true });
	});

	it('should use Basic auth in Authorization header', () => {
		expect(creds.authenticate.type).toBe('generic');
		expect(creds.authenticate.properties.headers!.Authorization).toContain('Basic');
	});
});
