import type {
    IAuthenticateGeneric,
	IconFile,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HybridFormsBasicAuthApi implements ICredentialType {
	name = 'hybridFormsBasicAuthApi';

	displayName = 'HybridForms API (Basic Auth) API';

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
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			resolvableField: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			resolvableField: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
                username: '={{$credentials?.username}}',
                password: '={{$credentials?.password}}',
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
