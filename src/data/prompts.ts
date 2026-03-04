/* eslint-disable @typescript-eslint/no-unused-vars*/

// IMPORTANT: If changes are done here, apply the same changes to the prompts.ts in the dashboard!

/**
 * System prompt instructing the LLM to fix Turtle Syntax errors.
 */
export const ttlSyntaxFixPrompt = `
Given an input in Turtle Syntax with an array of error message, you will fix all of the errors. If they were to result in further errors, 
you will fix those as well. You will not modify any of the given triples, but only fix the syntax errors.
Output only the fixed Turtle Syntax, without any additional text or explanations. 
`

export const settingGenerationPrompts = [
    `
        Given a description of a medical simulation, you will generate a knowledge graph representing the simulation. The output must be valid Turtle Syntax representing the data correctly.

        Refer to the following template that you can expand upon for the output. You must, however, not introduce any new prefixes:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
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

        IMPORTANT: The following base entities will be created automatically and should NOT be included in your output:
        {{PREDEFINED_ENTITIES}}

        Focus on extracting additional entities relevant to the specific simulation scenario that are not already part of these predefined base entities.

        If given a default entity, you will add it as a Subject entity and generate fitting labels. 
        If no default entity is given, generate the entity "Instructor" of the type Subject. 

        Output the entities you've added in Turtle Syntax and always generate Labels in German, English and Swedish for each entity. The output must be structured as follows:

        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Care Staff"@en .
        # Other language labels
        '''

        Output only the requested Turtle Syntax, without any additional text or explanations.
    `
]

export const feedbackSystemPrompts = [
    // Entity Extraction Prompt
    `
        Given a description of a medical simulation, a potentially incomplete list of entities within the simulation and thoughts written down by a participant of the simulation (including their role within), you will extract additional entities mentioned in the notes and assign them one or multiple of the following classes according to their context in the given situation:
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

        Given entities may also be assigned additional classes. 

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
        
        Output the entities you've added in Turtle Syntax, generating Labels in German, English and Swedish for each entity. The output must not include any entity from the input and must be structured as follows:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
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

        Timestamp: "Timestamp of the feedback (Example: 2024-06-01T12:30:00Z)"
        
        Output the tensions/feedbacks/impressions in the following format, generating titles and descriptions in German, English and Swedish for each tension/feedback/(self)impression:

        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

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
        Given multiple Turtle Syntax inputs containing entities acting in a simulation scenario, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by combining the triples semantically and ensuring that there are no triples with duplicate meanings in the output.

        No new prefixes may be used.
        During this merging process no information must be lost!
        Make sure to generate a graph that is as complete but also as concise as possible.
        Output only the knowledge graph in Turtle Syntax, without any additional text or explanations.
    `,
    `
        Given multiple Turtle Syntax inputs containing conflicts and entities defined in Turtle Syntax as well, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by semantically by combining the conflicts and comments. Make sure that there are no conflicts with semantically duplicate content in the output.
        If two tensions/comments can be merged into one conflict or comment, you must list both original author entities using the "WrittenBy" predicate. Also generate a new title and description based on the merged content. Make sure to merge the participants as well. 

        All referenced entities using "WrittenBy" and "HasParticipant" must be present in the defined entities given in the input but not redefined in the final output. 

        If one feedback can be seen as a response to another feedback, you can also merge them by changing the conflict acting as a response to a comment and linking it to the conflict it responds to with the "HasComment" relation. This relation may only be used with a comment class rdf-subject as the rdf-object. 

        The Input will be structured as follows:
        Tensions: [
            "ttl1",
            "ttl2",
            ...
        ]
        Entities: "ttl"

        No new prefixes may be used. 
        Merge as many tensions/comments as possible without combining anything that isn't semantically similar. During this merging process no information must be lost!
        Make sure to generate a graph that is as complete but also as concise as possible.
        Output only the knowledge graph in Turtle Syntax, without any additional text or explanations.
    `
]