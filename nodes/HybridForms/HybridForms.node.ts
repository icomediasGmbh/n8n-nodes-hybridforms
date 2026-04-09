import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { hybridFormsApiRequest, buildSapiPath } from './GenericFunctions';
import { formOperations, formFields } from './resources/form';
import type {
	IManipulationDataFormat,
	IFormBinaryContent,
	IRepeatingUnitTab,
	RepeatingUnitTabs,
} from './types';

interface StructureField {
	id: string;
	type: string;
	label: string;
}

interface StructureBlock {
	fields: StructureField[];
}

interface StructureTab {
	blocks: StructureBlock[];
	blockTemplates?: StructureBlock[];
    repeatable?: boolean;
    id?: string;
}

interface StructureSection {
	tabs: StructureTab[];
}

interface FormStructure {
	sections: StructureSection[];
}

const credentialMap: Record<string, string> = {
	basicAuth: 'hybridFormsBasicAuthApi',
	bearerToken: 'hybridFormsApi',
	oAuth2: 'hybridFormsOAuth2Api',
};

function resolveCredentialName(authType: string): string {
	return credentialMap[authType] ?? 'hybridFormsApi';
}

export class HybridForms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HybridForms',
		name: 'hybridForms',
		documentationUrl: 'https://manuals.hybridforms.net/',
		icon: 'file:../../icons/hybridforms.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the HybridForms Simple-API',
		defaults: {
			name: 'HybridForms',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'hybridFormsApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['bearerToken'],
					},
				},
			},
			{
				name: 'hybridFormsBasicAuthApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['basicAuth'],
					},
				},
			},
			{
				name: 'hybridFormsOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth',
						value: 'basicAuth',
					},
					{
						name: 'Bearer Token',
						value: 'bearerToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'bearerToken',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Form',
						value: 'form',
					},
				],
				default: 'form',
			},
			...formOperations,
			...formFields,
		],
	};

	methods = {
		loadOptions: {
			async getFormFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const authType = this.getCurrentNodeParameter('authentication') as string;
				const credentialName = resolveCredentialName(authType);

				const credentials = await this.getCredentials(credentialName);
				const client = credentials.client as string;
				const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

				const formDefinitionId = this.getCurrentNodeParameter('formDefinitionId') as string;
				if (!formDefinitionId) {
					return [];
				}

				const url = `${serverUrl}/api/app/${encodeURIComponent(client)}/formdefinitions/${encodeURIComponent(formDefinitionId)}/structure`;

				const response = (await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
					method: 'GET',
					url: url,
					json: true,
				})) as FormStructure;

				const options: INodePropertyOptions[] = [];
				for (const section of response.sections ?? []) {
					for (const tab of section.tabs ?? []) {
                        if (!tab.repeatable) {
                            for (const block of tab.blocks ?? []) {
                                // Skip repeatable instance blocks when blockTemplates exist,
                                // as they contain suffixed IDs (_hfrepeating_N) instead of the
                                // canonical template IDs
                                for (const field of block.fields ?? []) {
                                    options.push({
                                        name: field.id + (field.label ? ` (${field.label})` : ''),
                                        value: field.id,
                                        description: `Type: ${field.type}`,
                                    });
                                }
                            }
                        }
					}
				}

				return options;
			},
			async getRuFormFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const authType = this.getCurrentNodeParameter('authentication') as string;
				const credentialName = resolveCredentialName(authType);

				const credentials = await this.getCredentials(credentialName);
				const client = credentials.client as string;
				const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

				const formDefinitionId = this.getCurrentNodeParameter('formDefinitionId') as string;
				if (!formDefinitionId) {
					return [];
				}

				const url = `${serverUrl}/api/app/${encodeURIComponent(client)}/formdefinitions/${encodeURIComponent(formDefinitionId)}/structure`;

				const response = (await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
					method: 'GET',
					url: url,
					json: true,
				})) as FormStructure;

				const options: INodePropertyOptions[] = [];
				for (const section of response.sections ?? []) {
					for (const tab of section.tabs ?? []) {
                        if (tab.repeatable) {
                            // Repeating unit fields are defined in blockTemplates with their
                            // canonical (non-suffixed) IDs
                            for (const block of tab.blockTemplates ?? []) {
                                for (const field of block.fields ?? []) {
                                    options.push({
                                        name: field.id + (field.label ? ` (${field.label})` : ''),
                                        value: field.id,
                                        description: `Type: ${field.type}`,
                                    });
                                }
                            }
                        }
					}
				}

				return options;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const authType = this.getNodeParameter('authentication', 0) as string;
		const credentialName = resolveCredentialName(authType);
		const credentials = await this.getCredentials(credentialName);
		const client = credentials.client as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: JsonObject;

				if (resource === 'form') {
					const formDefinitionId = this.getNodeParameter('formDefinitionId', i) as string;
					const body = await buildManipulationBody.call(this, i);

					if (operation === 'create') {
						const path = buildSapiPath(client, formDefinitionId);
						responseData = await hybridFormsApiRequest.call(
							this,
							credentialName,
							'POST',
							path,
							body,
						);
					} else if (operation === 'update') {
						const formId = this.getNodeParameter('formId', i) as string;
						const path = buildSapiPath(client, formDefinitionId, formId);
						responseData = await hybridFormsApiRequest.call(
							this,
							credentialName,
							'PUT',
							path,
							body,
						);
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

/**
 * Build an IManipulationDataFormat body from the node parameters.
 */
async function buildManipulationBody(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IManipulationDataFormat> {
	const body: IManipulationDataFormat = {};

	const title = this.getNodeParameter('title', itemIndex, '') as string;
	if (title) body.title = title;

	const culture = this.getNodeParameter('culture', itemIndex, '') as string;
	if (culture) body.culture = culture;

	const feedback = this.getNodeParameter('feedback', itemIndex, '') as string;
	if (feedback) body.feedback = feedback;

	// Fields (key-value pairs)
	const fieldsCollection = this.getNodeParameter('fields', itemIndex, {}) as {
		field?: Array<{ name: string; value: string }>;
	};
	if (fieldsCollection.field && fieldsCollection.field.length > 0) {
		const fields: Record<string, string> = {};
		for (const f of fieldsCollection.field) {
			fields[f.name] = f.value;
		}
		body.fields = fields;
	}

	// Repeating units
	const ruCollection = this.getNodeParameter('repeatingUnits', itemIndex, {}) as {
		item?: Array<{
			unitName: string;
			operation?: string;
			position?: number;
			fields?: { field?: Array<{ name: string; value: string }> };
		}>;
	};
	if (ruCollection.item && ruCollection.item.length > 0) {
		const repeatingUnits: RepeatingUnitTabs = {};
		for (const entry of ruCollection.item) {
			const tab: IRepeatingUnitTab = {};
			if (entry.operation) tab.operation = entry.operation as IRepeatingUnitTab['operation'];
			if (entry.position !== undefined) tab.position = entry.position;
			if (entry.fields?.field && entry.fields.field.length > 0) {
				const fields: Record<string, string> = {};
				for (const f of entry.fields.field) {
					fields[f.name] = f.value;
				}
				tab.fields = fields;
			}
			if (!repeatingUnits[entry.unitName]) {
				repeatingUnits[entry.unitName] = [];
			}
			repeatingUnits[entry.unitName].push(tab);
		}
		body.repeatingUnits = repeatingUnits;
	}

	// Pictures
	const picturesData = await parseBinaryContentCollection(this, 'pictures', itemIndex);
	if (picturesData.length > 0) body.pictures = picturesData;

	// Documents
	const documentsData = await parseBinaryContentCollection(this, 'documents', itemIndex);
	if (documentsData.length > 0) body.documents = documentsData;

	// Audio
	const audioData = await parseBinaryContentCollection(this, 'audio', itemIndex);
	if (audioData.length > 0) body.audio = audioData;

	return body;
}

interface BinaryContentInput {
	contentSource?: 'binaryProperty' | 'base64';
	binaryPropertyName?: string;
	content?: string;
	operation?: string;
	filename?: string;
	id?: string;
	remark?: string;
	hideInPDF?: boolean;
	readonly?: boolean;
}

async function parseBinaryContentCollection(
	ctx: IExecuteFunctions,
	paramName: string,
	itemIndex: number,
): Promise<IFormBinaryContent[]> {
	const collection = ctx.getNodeParameter(paramName, itemIndex, {}) as {
		item?: BinaryContentInput[];
	};
	if (!collection.item || collection.item.length === 0) return [];

	const results: IFormBinaryContent[] = [];

	for (const entry of collection.item) {
		let base64Content: string;

		if (entry.contentSource === 'binaryProperty') {
			const propName = entry.binaryPropertyName ?? 'data';
			const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, propName);
			base64Content = buffer.toString('base64');
		} else {
			base64Content = entry.content ?? '';
		}

		const item: IFormBinaryContent = {
			content: base64Content,
		};
		if (entry.operation) item.operation = entry.operation as IFormBinaryContent['operation'];
		if (entry.filename) item.filename = entry.filename;
		if (entry.id) item.id = entry.id;
		if (entry.remark) item.remark = entry.remark;
		if (entry.hideInPDF) item.hideInPDF = entry.hideInPDF;
		if (entry.readonly) item.readonly = entry.readonly;
		results.push(item);
	}

	return results;
}
