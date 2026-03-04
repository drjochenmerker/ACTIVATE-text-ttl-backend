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

/**
 * Generates a formatted list of predefined entities for the LLM prompt
 * @returns Formatted string listing all predefined entities with their classes
 */
export function getPredefinedEntitiesForPrompt(): string {
    const classMap: { [key: string]: string } = {
        'subjects': 'Subject',
        'objects': 'Object',
        'instruments': 'Instrument',
        'rules': 'Rule',
        'communities': 'Community',
        'divisionsOfLabour': 'DivisionOfLabour'
    };

    let entityList = '';
    const data = requiredEntitiesData as RequiredEntitiesStructure;
    
    for (const [classKey, className] of Object.entries(classMap)) {
        const entities = data[classKey as keyof RequiredEntitiesStructure] || [];
        for (const entity of entities) {
            entityList += `- "${entity.id}" (${className})\n`;
        }
    }

    return entityList || '- None';
}
