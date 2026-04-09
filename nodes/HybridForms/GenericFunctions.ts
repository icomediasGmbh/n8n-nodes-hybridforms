import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Build the base path for the Simple-API:
 * /api/app/{client}/formdefinitions/{formDefinitionId}/forms/sapi
 */
export function buildSapiPath(client: string, formDefinitionId: string, formId?: string): string {
	const base = `/api/app/${encodeURIComponent(client)}/formdefinitions/${encodeURIComponent(formDefinitionId)}/forms/sapi`;
	if (formId) {
		return `${base}/${encodeURIComponent(formId)}`;
	}
	return base;
}

export async function hybridFormsApiRequest(
	this: IExecuteFunctions,
	credentialName: string,
	method: IHttpRequestMethods,
	path: string,
	body: object = {},
	query: Record<string, string> = {},
): Promise<JsonObject> {
	const credentials = await this.getCredentials(credentialName);
	const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${serverUrl}${path}`,
		qs: query,
		body,
		json: true,
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialName,
			options,
		)) as JsonObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
