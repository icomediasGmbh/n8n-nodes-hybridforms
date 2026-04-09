export type FormFieldDictionary = Record<string, null | boolean | number | string | unknown[]>;

export enum FormManipulationOperationEnum {
	Create = 'create',
	Update = 'update',
	Delete = 'delete',
}

export interface IRepeatingUnitTab {
	operation?: FormManipulationOperationEnum;
	position?: number;
	fields?: FormFieldDictionary;
}

export type RepeatingUnitTabs = Record<string, IRepeatingUnitTab[]>;

export interface IFormBinaryContent {
	filename?: string;
	id?: string;
	remark?: string;
	hideInPDF?: boolean;
	readonly?: boolean;
	content: string;
	operation?: FormManipulationOperationEnum;
}

export interface IManipulationDataFormat {
	culture?: string;
	title?: string;
	feedback?: string;
	fields?: FormFieldDictionary;
	repeatingUnits?: RepeatingUnitTabs;
	pictures?: IFormBinaryContent[];
	documents?: IFormBinaryContent[];
	audio?: IFormBinaryContent[];
}
