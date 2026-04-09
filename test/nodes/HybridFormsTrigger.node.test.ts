import { describe, it, expect } from 'vitest';
import { HybridFormsTrigger } from '../../nodes/HybridFormsTrigger/HybridFormsTrigger.node';

describe('HybridFormsTrigger Node', () => {
	const node = new HybridFormsTrigger();

	it('should have correct node metadata', () => {
		expect(node.description.displayName).toBe('HybridForms Trigger');
		expect(node.description.name).toBe('hybridFormsTrigger');
		expect(node.description.version).toBe(1);
		expect(node.description.group).toEqual(['trigger']);
	});

	it('should be a polling trigger', () => {
		expect(node.description.polling).toBe(true);
		expect(node.description.inputs).toEqual([]);
	});

	it('should declare all three credential types', () => {
		const credNames = node.description.credentials!.map((c) => c.name);
		expect(credNames).toContain('hybridFormsApi');
		expect(credNames).toContain('hybridFormsBasicAuthApi');
		expect(credNames).toContain('hybridFormsOAuth2Api');
	});

	it('should have an authentication selector', () => {
		const authProp = node.description.properties.find((p) => p.name === 'authentication');
		expect(authProp).toBeDefined();
		const values = (authProp as { options: Array<{ value: string }> }).options.map((o) => o.value);
		expect(values).toEqual(['basicAuth', 'bearerToken', 'oAuth2']);
	});

	it('should require formDefinitionId and formId', () => {
		const fdProp = node.description.properties.find((p) => p.name === 'formDefinitionId');
		expect(fdProp).toBeDefined();
		expect(fdProp!.required).toBe(true);

		const fProp = node.description.properties.find((p) => p.name === 'formId');
		expect(fProp).toBeDefined();
		expect(fProp!.required).toBe(true);
	});

	it('should have a poll method', () => {
		expect(node.poll).toBeTypeOf('function');
	});
});
