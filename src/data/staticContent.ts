/**
 * staticContent contains the terms and phrases that helps the user understand
 * It also provides the terms in the 3 main languages English, German and Swedish
 */
export const errorMessages = {
    missingFields: {
        en: "Generator, LLM or Input-Text is missing",
        de: "Generator, LLM oder Eingabetext fehlt",
        sv: "Generator, LLM eller inmatningstext saknas",
    },
    unsupportedLLM: {
        en: 'Chosen LLM currently not supported',
        de: 'Gewähltes LLM wird derzeit nicht unterstützt',
        sv: 'Valt LLM stöds för närvarande inte',
    },
    unsupportedGenerator: {
        en: 'Chosen generator currently not supported',
        de: 'Gewählter Generator wird derzeit nicht unterstützt',
        sv: 'Vald generator stöds för närvarande inte',
    },
    validationFailed: {
        en: 'Validation of the generated Turtle Syntax failed after multiple attempts',
        de: 'Validierung der generierten Turtle-Syntax ist nach mehreren Versuchen fehlgeschlagen',
        sv: 'Validering av den genererade Turtle-syntaxen misslyckades efter flera försök',
    },
    generationFailed: {
        en: 'The chosen generator failed to generate Turtle Syntax',
        de: 'Der gewählte Generator konnte keine Turtle-Syntax generieren',
        sv: 'Den valda generatorn misslyckades med att generera Turtle-syntax',
    },
}