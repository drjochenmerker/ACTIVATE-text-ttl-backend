/* eslint-disable @typescript-eslint/no-unused-vars*/

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
        Given a description of a medical simulation, you will extract a fitting name and a description for the given setting. 
        Output the results in Turtle Syntax, generating Labels in German, English and Swedish. 
    
        Refer to the following template for the output that you can expand upon:
        
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    
        :UniqueIdentifier a owl:NamedIndividual ;
        :ActivityDescription "description"@en ;
        # Other language descriptions
        :ActivityName "name"@en .
        # Other language names
        '''
    
        Output only the requested Turtle Syntax, without any additional text or explanations.
    `,
    `
        Given a description of a medical simulation, you will extract all entities present and assign them one or multiple of the following classes according to their context in the given situation:
        ${classExplanation}

        One entity that must always be present is the Instructor, which is a Subject entity.

        Output the entities you've added in Turtle Syntax, generating Labels in German, English and Swedish for each entity, structured as follows:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output only the requested Turtle Syntax, without any additional text or explanations.
    `
]

export const feedbackSystemPrompts = [
    // Entity Extraction Prompt
    `
        Given a description of a medical simulation, a potentially incomplete list of entities within the simulation and thoughts written down by a participant of the simulation (including their role within), you will extract additional entities mentioned in the notes and assign them one
        or multiple of the following classes according to their context in the given situation:
        ${classExplanation}

        Given entities may also be assigned additional classes. 

        The input will be structured as follows:
        Setting: "Description of the medical simulation"
        Existing Entities: [(entity1, entity1Class), (entity2, entity2Class), ...]
        Feedback: "Thoughts written down by the participant"
        
        Output the entities you've added in Turtle Syntax, generating Labels in German, English and Swedish for each entity, structured as follows:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output only the requested format, without any additional text or explanations and do not include any existing entity from the input.
    `,
    // Tension Extraction Prompt
    `
        Given a description of a medical simulation, a list of entities within the simulation and thoughts written down by a participant of the simulation (including their role within), you will extract all important tensions, feedbacks and (self)impressions between/of the entities
        and write transform them to Turtle Syntax.

        The extracted tensions, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
        a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
        given entities that initiated the conflict/feedback/impression.
        If entities are involved in a conflict/feedback/impression, they must be linked
        with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have participants from
        more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
        combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
        combinations of three classes are not allowed! Make sure to never break this rule. 
        If the participants belong to just one or two classes, the classes may be chosen freely.   

        If other entities respond to a conflict/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked
        to the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
        ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
        The comments may have further comments which must also be linked in the same way using "HasComment".

        You must also always keep track which participant thought you extracted the conflict/feedback/(self)impression from.

        The input will be structured as follows:
        Setting: "Description of the medical simulation"
        Existing Entities: [{"label":"nurse","classes":["subject"]}, ...]
        Feedback: {
            "role": "nurse",
            "case": "caseId",
            "data": [
                {
                "question1": "How do you feel about the interprofessional collaboration simulation you have just completed?",
                "answer1": "- some thoughts",
                "question2": "Think of a part of the activity that you found very positive, constructive or satisfying. Please describe what happened in this phase in a few sentences.",
                "answer2": "- some positive thoughts",
                "question3": "Think of a part of the activity that you found very negative, counterproductive or disappointing. Please describe what happened in this phase in a few sentences.",
                "answer3": "- some negative thoughts"
                }
            ]
        }
        Timestamp: "Timestamp of the feedback (Example: 2024-06-01T12:30:00Z)"
        
        Output the tensions/feedbacks/impressions in the following format, generating titles and descriptions in German, English and Swedish for each conflict/feedback/(self)impression:

        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :ConflictID a :Conflict ;
        :ConflictTitle "Title"@en ;
        # Other language titles
        :ConflictDescription "Description"@en ;
        # Other language descriptions  
        :ConflictState "open" ;
        :WrittenBy "Label of entity that initiated the conflict/feedback/(self)impression"@en
        # Other language authors;
        :HasParticipant :EntityIDs ;
        :CreationDate "Timestamp" ;
        :Origin: "Question and Answer of source as rdf:json" .

        :CommentID a :Comment ;
        :CommentDescription "Comment"@en ;
        # Other language comments
        :WrittenBy "Label of entity that initiated the conflict/feedback/(self)impression"@en
        # Other language authors;
        :CreationDate "Timestamp" .
        :Origin: "Question and Answer of source as rdf:json"

        :ConflictIDorCommentID :HasComment :CommentID .
        '''

        Output only the requested format, without any additional text or explanations. 
    `,
]

export const ttlMergePrompts = [
    `
        Given multiple Turtle Syntax inputs containing entities acting in a simulation scenario, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by
        combining the triples semantically and ensuring that there are no triples with duplicate meanings in the output.

        No new prefixes may be used.
        ${ttlOnlyInstruction}
    `,
    `
        Given multiple Turtle Syntax inputs containing conflicts, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by semantically by combining the triples and ensuring that there are no duplicate triples in the output.
        If two authors have given semantically identical feedback, you can merge them into one conflict or comment by combinding the authors in the "WrittenBy" field and merging the descriptions. In such a case, make sure to merge the participants as well. 

        If one feedback can be seen as a response to another feedback, you can merge them by changing the conflict acting as a response to a comment and linking it to the conflict it responds to with the "HasComment" relation. This relation may only be used with a comment class rdf-subject as the rdf-object. 

        No new prefixes may be used. 
        ${ttlOnlyInstruction}
    `
]