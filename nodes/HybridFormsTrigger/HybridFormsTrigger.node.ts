import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

const credentialMap: Record<string, string> = {
	basicAuth: 'hybridFormsBasicAuthApi',
	bearerToken: 'hybridFormsApi',
	oAuth2: 'hybridFormsOAuth2Api',
};

function resolveCredentialName(authType: string): string {
	return credentialMap[authType] ?? 'hybridFormsApi';
}

export class HybridFormsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HybridForms Trigger',
		name: 'hybridFormsTrigger',
		documentationUrl: 'https://manuals.hybridforms.net/',
		icon: 'file:../../icons/hybridforms.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Polling: {{$parameter["formDefinitionId"]}}',
		description: 'Polls a HybridForms form instance for changes',
		defaults: {
			name: 'HybridForms Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
        usableAsTool: true,
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
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'Basic Auth', value: 'basicAuth' },
					{ name: 'Bearer Token', value: 'bearerToken' },
					{ name: 'OAuth2', value: 'oAuth2' },
				],
				default: 'bearerToken',
			},
			{
				displayName: 'Form Definition ID',
				name: 'formDefinitionId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the form definition',
			},
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of the form instance to poll',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const authType = this.getNodeParameter('authentication') as string;
		const credentialName = resolveCredentialName(authType);
		const credentials = await this.getCredentials(credentialName);

		const client = credentials.client as string;
		const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');
		const formDefinitionId = this.getNodeParameter('formDefinitionId') as string;
		const formId = this.getNodeParameter('formId') as string;

		const url =
			`${serverUrl}/api/app/${encodeURIComponent(client)}` +
			`/formdefinitions/${encodeURIComponent(formDefinitionId)}` +
			`/forms/${encodeURIComponent(formId)}`;

		const response = (await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
			method: 'GET',
			url: url,
			json: true,
		})) as JsonObject;

		const responseHash = JSON.stringify(response);
		const stateData = this.getWorkflowStaticData('node');
		const previousHash = stateData.lastHash as string | undefined;

		if (previousHash === responseHash) {
			return null;
		}

		stateData.lastHash = responseHash;

		return [[{ json: response }]];
	}
}
