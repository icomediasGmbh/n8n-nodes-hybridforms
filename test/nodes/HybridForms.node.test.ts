import { describe, it, expect } from 'vitest';
import { HybridForms } from '../../nodes/HybridForms/HybridForms.node';

describe('HybridForms Node', () => {
	const node = new HybridForms();

	it('should have correct node metadata', () => {
		expect(node.description.displayName).toBe('HybridForms');
		expect(node.description.name).toBe('hybridForms');
		expect(node.description.version).toBe(1);
	});

	it('should declare both credential types', () => {
		const credNames = node.description.credentials!.map((c) => c.name);
		expect(credNames).toContain('hybridFormsApi');
		expect(credNames).toContain('hybridFormsBasicAuthApi');
		expect(credNames).toContain('hybridFormsOAuth2Api');
	});

	it('should have an authentication selector', () => {
		const authProp = node.description.properties.find((p) => p.name === 'authentication');
		expect(authProp).toBeDefined();
		const authOptions = (authProp as { options: Array<{ value: string }> }).options;
		const values = authOptions.map((o) => o.value);
		expect(values).toEqual(['basicAuth', 'bearerToken', 'oAuth2']);
	});

	it('should define form resource', () => {
		const resourceProp = node.description.properties.find((p) => p.name === 'resource');
		expect(resourceProp).toBeDefined();
		expect(resourceProp!.type).toBe('options');

		const resourceOptions = (resourceProp as { options: Array<{ value: string }> }).options;
		const values = resourceOptions.map((o) => o.value);
		expect(values).toContain('form');
	});

	it('should define only Create and Update operations', () => {
		const opProp = node.description.properties.find(
			(p) =>
				p.name === 'operation' &&
				p.displayOptions?.show?.resource?.includes('form'),
		);
		expect(opProp).toBeDefined();

		const opOptions = (opProp as { options: Array<{ value: string }> }).options;
		const values = opOptions.map((o) => o.value);
		expect(values).toEqual(['create', 'update']);
	});

	it('should require formDefinitionId for all operations', () => {
		const fdIdProp = node.description.properties.find(
			(p) => p.name === 'formDefinitionId',
		);
		expect(fdIdProp).toBeDefined();
		expect(fdIdProp!.required).toBe(true);
		expect(fdIdProp!.displayOptions?.show?.resource).toContain('form');
	});

	it('should require formId only for update', () => {
		const formIdProp = node.description.properties.find((p) => p.name === 'formId');
		expect(formIdProp).toBeDefined();
		expect(formIdProp!.required).toBe(true);

		const showOps = formIdProp!.displayOptions?.show?.operation as string[];
		expect(showOps).toEqual(['update']);
	});

	it('should expose manipulation data fields for create/update', () => {
		const manipulationFieldNames = ['title', 'culture', 'feedback', 'fields',
			'repeatingUnits', 'pictures', 'documents', 'audio'];

		for (const fieldName of manipulationFieldNames) {
			const prop = node.description.properties.find((p) => p.name === fieldName);
			expect(prop, `expected field "${fieldName}" to exist`).toBeDefined();

			const showOps = prop!.displayOptions?.show?.operation as string[];
			expect(showOps).toContain('create');
			expect(showOps).toContain('update');
		}
	});

	it('should be usable as a tool', () => {
		expect(node.description.usableAsTool).toBe(true);
	});

	it('should define a getFormFields loadOptions method', () => {
		expect(node.methods).toBeDefined();
		expect(node.methods!.loadOptions).toBeDefined();
		expect(node.methods!.loadOptions!.getFormFields).toBeTypeOf('function');
	});

	it('should use loadOptionsMethod for field name inside fields collection', () => {
		const fieldsProp = node.description.properties.find((p) => p.name === 'fields');
		expect(fieldsProp).toBeDefined();

		const fieldOption = (fieldsProp as any).options[0];
		const nameProp = fieldOption.values.find((v: any) => v.name === 'name');
		expect(nameProp.type).toBe('options');
		expect(nameProp.typeOptions.loadOptionsMethod).toBe('getFormFields');
		expect(nameProp.typeOptions.loadOptionsDependsOn).toContain('formDefinitionId');
	});
});
