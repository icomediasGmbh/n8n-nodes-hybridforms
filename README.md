# n8n-nodes-hybridforms

This is an n8n community node package for integrating with the [HybridForms](https://www.hybridforms.net) Simple-API. It lets you create and update HybridForms form instances directly from your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Nodes

### HybridForms

Interact with the HybridForms Simple-API to manage form instances.

**Operations:**

| Resource | Operation | Description |
|----------|-----------|-------------|
| Form | Create | Create a new form instance |
| Form | Update | Update an existing form instance |

When creating or updating forms you can set:

- **Title** - Form instance title
- **Culture** - Locale code (e.g. `de-AT`, `en-US`)
- **Feedback** - Feedback text
- **Fields** - Key-value pairs for form fields (field names are loaded dynamically from the form definition)
- **Repeating Units** - Create, update, or delete repeating unit tabs with their own fields
- **Pictures / Documents / Audio** - Attach binary content via a binary property from a previous node or as a base64 string

### HybridForms Trigger

A polling trigger node that watches a specific form instance for changes and starts a workflow when the form data is modified.

**Parameters:**

- **Form Definition ID** - The form definition to watch
- **Form ID** - The specific form instance to poll

## Credentials

All nodes support three authentication methods:

| Method | Credential Type | Description |
|--------|----------------|-------------|
| Bearer Token | HybridForms API (Bearer Token) | Authenticate with a static bearer token |
| Basic Auth | HybridForms API (Basic Auth) | Authenticate with username and password |
| OAuth2 | HybridForms OAuth2 | Authenticate via OAuth2 authorization code flow |

Each credential requires:

- **Server URL** - Base URL of the HybridForms server (e.g. `https://example.hybridforms.net`)
- **Client** - The client identifier used in the API path

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [n8n](https://docs.n8n.io/hosting/installation/)

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Test

```bash
npm test
```

### Local development

Use the dev command to run n8n with the node loaded locally:

```bash
npm run dev
```

## License

[MIT](https://opensource.org/licenses/MIT)
