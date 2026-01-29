const classExplanation = `
    - "Subject" (Who are the actors in the action? Family physician, Medical specialist, Nurse, Social worker, Carers etc. 
    What perceptions, ideas and emotions are present in the actors? Uncertainty, Discomfort, Incompetence etc.),

    - "Object" (What is the goal of the action? Cure, Care, addressing psychosocial issues etc. On whom or what is this action taken?
    Patient, Relative, Blood sample etc. What action must be taken? Needs assessment, Reporting, Decisionmaking etc.),

    - "Instrument" (What physical means are used in the action? Patient record, Chart, Medical device, Telephone etc.
    Which abstract resources are deployed in the action? Conviction, Proactivity, Instruction etc.),

    - "Rule" (Which specific policies and rules are linked to the activity? Guidelines, Authorization, Reimbursements, Co-location etc.
    What implicit mores and conventions are linked to the activity? Priority, Career track, Professional jargon etc.),

    - "Community" (Where does the activity take place? Home, Nursing home, Hospital etc. What organization do the actors belong to?
    General University hospital, Independent Municipal health care practice etc. What conditions characterize this setting?
    Immediate needs, Distance, Shortage etc.)

    - "DivisionOfLabour" (How can different people contribute to the activity? Hierarchy, Role, Leadership, Territorial attitude etc.).
`

const ttlOnlyInstruction = `
    Make sure to generate a graph that is as complete but also as concise as possible.
    Output only the knowledge graph in Turtle Syntax, without any additional text or explanations.
`;

const ttlPrefixes = `
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .
`

/**
 * System prompt instructing the LLM to fix Turtle Syntax errors.
 */
export const ttlSyntaxFixPrompt = `
Given an input in Turtle Syntax with an array of error message, you will fix alle of the errors. If they were to result in further errors, 
you will fix those as well. You will not modify any of the given triples, but only fix the syntax errors.
Output only the fixed Turtle Syntax, without any additional text or explanations. 
`

export const settingGenerationPrompts = [
    `
        Given a description of a medical simulation, you will generate a knowledge graph representing the simulation. The output must be valid Turtle Syntax representing the data correctly.

        Refer to the following template that you can expand upon for the output. You must, however, not introduce any new prefixes:
        '''turtle
        ${ttlPrefixes}
        
        :UniqueIdentifier a owl:NamedIndividual ;
        :ActivityDescription "summarized description"@en ;
        # Other language descriptions
        :ActivityName "name"@en .
        # Other language names
        '''

        Any literals must be given a language tag and always be generated in German, English and Swedish!
        If given a title as part of the input, you will use it as the ActivityName, otherwise you will generate a fitting title from the description.
        
        Output only the requested Turtle Syntax, without any additional text or explanations.
    `,
    `
        Given a description of a medical simulation, you will extract all entities present and assign them one or multiple of the following classes according to their context in the given situation:
        ${classExplanation}

        You will however, always and without exeption add at least the following entities of the class "Subject": "Pflege01" (Care Staff), "Pflege02", "Arzt01" (Physician), "Arzt02", and "Physiotherapeut01" (Physiotherapist), "Physiotherapeut02".

        If given a default entity, you will add it as a Subject entity and generate fitting labels. 
        If no default entity is given, generate the entity "Instructor" of the type Subject. 

        Output the entities you've added in Turtle Syntax and always generate Labels in German, English and Swedish for each entity. The output must be structured as follows:

        '''turtle
        ${ttlPrefixes}
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Care Staff"@en .
        # Other language labels
        '''

        Output only the requested Turtle Syntax, without any additional text or explanations.
    `
]

const inputDescription = `
    The input will be structured as follows:
    Setting: "Description of the medical simulation"
    Existing Entities: [
        {
            id: entity1ID,
            classes: [
                "Subject"
            ] 
        },
        {
            id: entity2ID,
            classes: [
                "Object",
                "Rule",
            ]
        },
        ...
    ]
    Feedback: {
        "role": "authorEntityID",
        "data": [
                {
                "question": "question that the authorEntityID was asked",
                "answer": "answer that the authorEntityID gave"
                },
                ...
            ]
    }
`

export const feedbackSystemPrompts = [
    // Entity Extraction Prompt
    `
        Given a description of a medical simulation, a potentially incomplete list of entities within the simulation and thoughts written down by a participant of the simulation (including their role within), you will extract additional entities mentioned in the notes and assign them one or multiple of the following classes according to their context in the given situation:
        ${classExplanation}

        Given entities may also be assigned additional classes. 

        ${inputDescription}
        
        Output the entities you've added in Turtle Syntax, generating Labels in German, English and Swedish for each entity. The output must not include any entity from the input and must be structured as follows:
        '''turtle
        ${ttlPrefixes}
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Care Staff"@en .
        # Other language labels
        '''

        Output only the requested format, without any additional text or explanations and do not include any existing entity from the input.
    `,
    // Tension Extraction Prompt
    `
        Given a description of a medical simulation, a list of entities within the simulation and question-answer pairs containing thoughts written down by a participant of the simulation (including their role within), you will extract all important tensions, feedbacks and (self)impressions between/of the entities and write transform them to Turtle Syntax.

        The extracted tensions, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"), a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the given entities that initiated the tension/feedback/impression.
        If entities are involved in a tension/feedback/impression, they must be linked with the relation "HasParticipant" with the tension/feedback/impression as the source entity. A tension/feedback/impression must not have participants from more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other combinations of three classes are not allowed! Make sure to never break this rule.  If the participants belong to just one or two classes, the classes may be chosen freely.   

        If other entities respond to a tension/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked to the tension/feedback/impression with the relation "HasComment".
        The comment must have a unique identifier a description which must not be a direct quote ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the tension/feedback/impression. The comments may have further comments which must also be linked in the same way using "HasComment".

        You must also always keep track which question-answer pair you extracted the tension/feedback/(self)impression from and each tension/feedback/(self)impression and comment must be marked as ai generated. 

        Depending on the content of the extracted tension/feedback/impression, the intent must be derived. You may only use the following three intents: ":Negative", ":Positive" and ":Neutral".

        ${inputDescription}
        Timestamp: "Timestamp of the feedback (Example: 2024-06-01T12:30:00Z)"
        
        Output the tensions/feedbacks/impressions in the following format, generating titles and descriptions in German, English and Swedish for each tension/feedback/(self)impression:

        '''turtle
        ${ttlPrefixes}

        :ConflictID a :Conflict ;
        :ConflictTitle "Title"@en ;
        # Other language titles
        :ConflictDescription "Description"@en ;
        # Other language descriptions  
        :ConflictState "open" ;
        :WrittenBy :Entity ;
        # Other language authors;
        :HasParticipant :EntityIDs ;
        :CreationDate "Timestamp" ;
        :IsAI true ;
        :HasIntent :Intent ;
        :Origin: "Question and Answer of source as rdf:json" .

        :CommentID a :Comment ;
        :CommentDescription "Comment"@en ;
        # Other language comments
        :WrittenBy :Entity ;
        # Other language authors
        :CreationDate "Timestamp" ;
        :IsAI true ;
        :Origin: "Question and Answer of source as rdf:json" .

        :ConflictIDorCommentID :HasComment :CommentID .
        '''

        Output only the requested format, without any additional text or explanations. 
    `,
]
export const ttlMergePrompts = [
    `
    You are given multiple Turtle (TTL) syntax inputs representing entities and their actions in a simulation. Your task is to **merge them into a single, valid Turtle output** while strictly following these rules:

    1. **Do not concatenate inputs**. Merge triples **semantically**, keeping all original information.
    2. **Preserve all triples**. Do not remove anything unless it is an exact semantic duplicate.
    3. **Do not introduce new prefixes**. Use only the prefixes already present in the inputs.
    4. Maintain TTL syntax: all subjects, predicates, and objects must be valid.
    5. Keep all entities as they are defined in the input; do not redefine them.

    ${ttlOnlyInstruction}
    `,

    `
    You are given multiple Turtle (TTL) syntax inputs representing **conflicts, comments, and entities**. Merge them into a single TTL output while strictly following these rules:

    1. **Semantic merging only**: combine conflicts or comments **only if their meaning is identical or extremely close**.
    2. **Preserve authorship**: if merged content has multiple authors, list all using the "WrittenBy" predicate.
    3. **Merge participants**: include all participants using "HasParticipant", but only reference entities already defined in the input; do not redefine them.
    4. **Conflict-comment relationships**: if one comment is a response to a conflict, link it using "HasComment". Only use "HasComment" if the object is of class comment.
    5. **Generate new metadata**: for any merged conflict or comment, create a new title and description that accurately represents the merged content.
    6. **Avoid information loss**: every piece of input data must appear in the merged output, either merged or individually.
    7. **No new prefixes**: retain only the prefixes from the input files.
    8. **TTL syntax compliance**: ensure all subjects, predicates, and objects are valid, and no triples are broken or dangling.
    9. **Do not merge if uncertain**:  
   - Only merge triples, conflicts, or comments if you are certain they are semantically identical or extremely close in meaning.  
   - If you are unsure whether two items represent the same meaning, keep them as separate triples or comments in the output.  
   - Avoid guessing or combining items based on superficial similarity.

    Input structure:
    Tensions: [
        "ttl1",
        "ttl2",
        ...
    ]
    Entities: "ttl"

    ${ttlOnlyInstruction}
    `
]