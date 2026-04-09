import type { INodeProperties } from 'n8n-workflow';

const fieldKeyValuePair: INodeProperties[] = [
	{
		displayName: 'Field Name or ID',
		name: 'name',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getFormFields',
			loadOptionsDependsOn: ['formDefinitionId'],
		},
		default: '',
		description: 'The name of the form field (loaded from form definition structure). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Field Value',
		name: 'value',
		type: 'string',
		default: '',
		description: 'The value to set for the field',
	},
];

function binaryContentFields(label: string): INodeProperties[] {
	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{ name: 'Create', value: 'create' },
				{ name: 'Update', value: 'update' },
				{ name: 'Delete', value: 'delete' },
			],
			default: 'create',
			description: `Whether to create, update, or delete the ${label}`,
		},
		{
			displayName: 'Content Source',
			name: 'contentSource',
			type: 'options',
			options: [
				{ name: 'Binary Property', value: 'binaryProperty' },
				{ name: 'Base64 String', value: 'base64' },
			],
			default: 'binaryProperty',
			description: `How to provide the ${label} content`,
		},
		{
			displayName: 'Binary Property',
			name: 'binaryPropertyName',
			type: 'string',
			default: 'data',
			required: true,
			displayOptions: {
				show: {
					contentSource: ['binaryProperty'],
				},
			},
			description: `Name of the binary property from a previous step containing the ${label} data`,
		},
		{
			displayName: 'Base64 Content',
			name: 'content',
			type: 'string',
			default: '',
			required: true,
			displayOptions: {
				show: {
					contentSource: ['base64'],
				},
			},
			description: `Base64-encoded content of the ${label}`,
		},
		{
			displayName: 'Filename',
			name: 'filename',
			type: 'string',
			default: '',
			description: `Filename of the ${label}`,
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			default: '',
			description: `ID of an existing ${label} (for update/delete)`,
		},
		{
			displayName: 'Remark',
			name: 'remark',
			type: 'string',
			default: '',
			description: `Remark or note for the ${label}`,
		},
		{
			displayName: 'Hide in PDF',
			name: 'hideInPDF',
			type: 'boolean',
			default: false,
			description: `Whether to hide the ${label} in PDF exports`,
		},
		{
			displayName: 'Readonly',
			name: 'readonly',
			type: 'boolean',
			default: false,
			description: `Whether the ${label} is read-only`,
		},
	];
}

export const formOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['form'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new form instance via Simple-API',
				action: 'Create a form',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing form instance via Simple-API',
				action: 'Update a form',
			},
		],
		default: 'create',
	},
];

export const formFields: INodeProperties[] = [
	// ----------------------------------
	//       shared: identifiers
	// ----------------------------------
	{
		displayName: 'Form Definition ID',
		name: 'formDefinitionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['form'],
			},
		},
		description: 'The ID of the form definition',
	},
	{
		displayName: 'Form ID',
		name: 'formId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['update'],
			},
		},
		description: 'The ID of the form instance',
	},

	// ----------------------------------
	//       create / update: body
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		description: 'Title of the form instance',
	},
	{
		displayName: 'Culture',
		name: 'culture',
		type: 'string',
		default: '',
		placeholder: 'de-AT',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		description: 'Culture/locale code for the form (e.g. de-AT, en-US)',
	},
	{
		displayName: 'Feedback',
		name: 'feedback',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		description: 'Feedback text for the form',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: fieldKeyValuePair,
			},
		],
		description: 'Form field values to set (key-value pairs)',
	},
	{
		displayName: 'Repeating Units',
		name: 'repeatingUnits',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Repeating Unit',
				name: 'item',
				values: [
					{
						displayName: 'Unit Name',
						name: 'unitName',
						type: 'string',
						default: '',
						required: true,
						description: 'The name/key of the repeating unit',
					},
					{
						displayName: 'Operation',
						name: 'operation',
						type: 'options',
						noDataExpression: true,
						options: [
							{ name: 'Create', value: 'create' },
							{ name: 'Update', value: 'update' },
							{ name: 'Delete', value: 'delete' },
						],
						default: 'create',
						description: 'Whether to create, update, or delete the tab',
					},
					{
						displayName: 'Position',
						name: 'position',
						type: 'number',
						default: 0,
						description: 'The position/index of the tab',
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						options: [
							{
								displayName: 'Field',
								name: 'field',
								values: fieldKeyValuePair,
							},
						],
						description: 'Field values to set on this repeating unit tab',
					},
				],
			},
		],
		description: 'Repeating unit tabs to create, update, or delete',
	},
	{
		displayName: 'Pictures',
		name: 'pictures',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Picture',
				name: 'item',
				values: binaryContentFields('picture'),
			},
		],
		description: 'Pictures to attach to the form',
	},
	{
		displayName: 'Documents',
		name: 'documents',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Document',
				name: 'item',
				values: binaryContentFields('document'),
			},
		],
		description: 'Documents to attach to the form',
	},
	{
		displayName: 'Audio',
		name: 'audio',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				resource: ['form'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Audio File',
				name: 'item',
				values: binaryContentFields('audio file'),
			},
		],
		description: 'Audio files to attach to the form',
	},
];
