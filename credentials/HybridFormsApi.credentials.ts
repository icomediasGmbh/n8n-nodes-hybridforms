import type {
	IAuthenticateGeneric,
	IconFile,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HybridFormsApi implements ICredentialType {
	name = 'hybridFormsApi';

	displayName = 'HybridForms API (Bearer Token) API';

	documentationUrl = 'https://manuals.hybridforms.net/';

	icon = 'file:../icons/hybridforms.svg' as IconFile;

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			placeholder: 'https://example.hybridforms.net',
			description: 'The base URL of the HybridForms server (without trailing slash)',
			required: true,
		},
		{
			displayName: 'Client',
			name: 'client',
			type: 'string',
			default: '',
			placeholder: 'my-client',
			description: 'The client identifier used in the API path',
			required: true,
		},
		{
			displayName: 'Bearer Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.token}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.serverUrl}}',
			url: '/api/app/userdata',
		},
	};
}
