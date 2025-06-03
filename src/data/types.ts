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
};
// Generator-Pipeline type definition
export type GeneratorPipeline = {
    id: string;
    name: multiLanguageString;
    description: multiLanguageString;
};
