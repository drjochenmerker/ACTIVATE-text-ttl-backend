// Enum containing all supported languages
export enum LanguageCode {
    Deutsch = 'de',
    English = 'en',
    Svenska = 'sv',
}
// Multi-language string type definition
type multiLanguageString = {
    [key in LanguageCode]: string;
};
// LLM type definition
export type LLM = {
    id: string;
    name: string;
    endpoint: string;
    description: multiLanguageString;
    temperature: number;
    organizationId: string | null;
};