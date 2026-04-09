import type { IconFile, ICredentialType, INodeProperties } from 'n8n-workflow';

export class HybridFormsOAuth2Api implements ICredentialType {
	name = 'hybridFormsOAuth2Api';

	displayName = 'HybridForms OAuth2 API';

	documentationUrl = 'https://manuals.hybridforms.net/';

    icon = 'file:../icons/hybridforms.svg' as IconFile;

	extends = ['oAuth2Api'];

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
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: '',
			placeholder: 'https://example.hybridforms.net/oauth2/authorize',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: '',
			placeholder: 'https://example.hybridforms.net/oauth2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: '',
			placeholder: 'api',
			description: 'OAuth2 scopes to request (space-separated)',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
