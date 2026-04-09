import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

interface FormEntry {
	itemID: string;
	modified: string;
	[key: string]: unknown;
}

interface FormsListResponse {
	forms: FormEntry[];
}

const credentialMap: Record<string, string> = {
	basicAuth: 'hybridFormsBasicAuthApi',
	bearerToken: 'hybridFormsApi',
	oAuth2: 'hybridFormsOAuth2Api',
};

function resolveCredentialName(authType: string): string {
	return credentialMap[authType] ?? 'hybridFormsApi';
}

export class HybridFormsListTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HybridForms List Trigger',
		name: 'hybridFormsListTrigger',
		documentationUrl: 'https://manuals.hybridforms.net/',
		icon: 'file:../../icons/hybridforms.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Polling: {{$parameter["formDefinitionId"]}}',
		description: 'Polls HybridForms for new or changed form instances',
		defaults: {
			name: 'HybridForms List Trigger',
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
				description: 'The ID of the form definition to poll for form instances',
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

		const url =
			`${serverUrl}/api/app/${encodeURIComponent(client)}` +
			`/formdefinitions/${encodeURIComponent(formDefinitionId)}` +
			`/forms/?format=minimal&allforms=true`;

		const response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialName,
			{
				method: 'GET',
				url,
				json: true,
			},
		)) as FormsListResponse;

		const forms = response.forms ?? [];

		// Build a lookup: itemID -> modified timestamp
		const currentState: Record<string, string> = {};
		for (const form of forms) {
			currentState[form.itemID] = form.modified;
		}

		const stateData = this.getWorkflowStaticData('node');
		const previousState = stateData.formStates as Record<string, string> | undefined;

		// Always persist the current state for next poll
		stateData.formStates = currentState;

		// On the very first poll there is no previous state — return all forms
		if (!previousState) {
			if (forms.length === 0) {
				return null;
			}
			return [forms.map((form) => ({ json: form as unknown as JsonObject }))];
		}

		// Find new or modified forms
		const changedForms = forms.filter((form) => {
			const prev = previousState[form.itemID];
			// New form (not seen before) or modified timestamp changed
			return prev === undefined || prev !== form.modified;
		});

		if (changedForms.length === 0) {
			return null;
		}

		return [changedForms.map((form) => ({ json: form as unknown as JsonObject }))];
	}
}
