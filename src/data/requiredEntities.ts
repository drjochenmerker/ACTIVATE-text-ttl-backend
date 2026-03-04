import requiredEntitiesData from './requiredEntities.json' with { type: 'json' };

export interface RequiredEntity {
    id: string;
    labels: {
        [key: string]: string;
    };
}

export interface RequiredEntitiesStructure {
    subjects: RequiredEntity[];
    objects: RequiredEntity[];
    instruments: RequiredEntity[];
    rules: RequiredEntity[];
    communities: RequiredEntity[];
    divisionsOfLabour: RequiredEntity[];
}

function parseRequiredEntitiesOrFallback(customPredefinedEntitiesJson?: string): RequiredEntitiesStructure {
    if (!customPredefinedEntitiesJson || !customPredefinedEntitiesJson.trim()) {
        return requiredEntitiesData as RequiredEntitiesStructure;
    }

    try {
        const parsed = JSON.parse(customPredefinedEntitiesJson) as Partial<RequiredEntitiesStructure>;
        return {
            subjects: parsed.subjects ?? [],
            objects: parsed.objects ?? [],
            instruments: parsed.instruments ?? [],
            rules: parsed.rules ?? [],
            communities: parsed.communities ?? [],
            divisionsOfLabour: parsed.divisionsOfLabour ?? [],
        };
    } catch (error) {
        console.error('Invalid predefinedEntities JSON, using default requiredEntities.json', error);
        return requiredEntitiesData as RequiredEntitiesStructure;
    }
}

/**
 * Generates a formatted list of predefined entities for the LLM prompt
 * @returns Formatted string listing all predefined entities with their classes
 */
export function getPredefinedEntitiesForPrompt(customPredefinedEntitiesJson?: string): string {
    const classMap: { [key: string]: string } = {
        'subjects': 'Subject',
        'objects': 'Object',
        'instruments': 'Instrument',
        'rules': 'Rule',
        'communities': 'Community',
        'divisionsOfLabour': 'DivisionOfLabour'
    };

    let entityList = '';
    const data = parseRequiredEntitiesOrFallback(customPredefinedEntitiesJson);
    
    for (const [classKey, className] of Object.entries(classMap)) {
        const entities = data[classKey as keyof RequiredEntitiesStructure] || [];
        for (const entity of entities) {
            entityList += `- "${entity.id}" (${className})\n`;
        }
    }

    return entityList || '- None';
}
