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
`;

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
`;

/**
 * System prompt instructing the LLM to fix Turtle Syntax errors.
 */
export const ttlSyntaxFixPrompt = `
Given an input in Turtle Syntax with an array of error message, you will fix alle of the errors. If they were to result in further errors, 
you will fix those as well. You will not modify any of the given triples, but only fix the syntax errors.
Output only the fixed Turtle Syntax, without any additional text or explanations. 
`;

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

        However, you will always create 20 instances of the “Subject” class. Crucially, these instances must be named exactly as listed below, using the entity type followed by a numerical suffix (01, 02, 03, or 04).
            - Physician 01
            - Physician 02
            - Physician 03
            - Physician 04
            - Nurse 01
            - Nurse 02
            - Nurse 03
            - Nurse 04
            - Occupational Therapist 01
            - Occupational Therapist 02
            - Occupational Therapist 03
            - Occupational Therapist 04
            - Physiotherapist 01
            - Physiotherapist 02
            - Physiotherapist 03
            - Physiotherapist 04
            - Pharmacist 01
            - Pharmacist 02
            - Pharmacist 03
            - Pharmacist 04

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
    `,
];

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
`;

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
    // Tension Extraction Prompt from Feedback Questions
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
    // Tension Extraction Prompt from Transcript
    // todo check this prompt
    `
        Given a description of a medical simulation, a list of entities within the simulation and a transcript of a debriefing , you will extract all important tensions, feedbacks and (self)impressions between/of the entities and write transform them to Turtle Syntax.

        The extracted tensions, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"), a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the given entities that initiated the tension/feedback/impression.
        If entities are involved in a tension/feedback/impression, they must be linked with the relation "HasParticipant" with the tension/feedback/impression as the source entity. A tension/feedback/impression must not have participants from more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other combinations of three classes are not allowed! Make sure to never break this rule.  If the participants belong to just one or two classes, the classes may be chosen freely.   

        If other entities respond to a tension/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked to the tension/feedback/impression with the relation "HasComment".
        The comment must have a unique identifier a description which must not be a direct quote ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the tension/feedback/impression. The comments may have further comments which must also be linked in the same way using "HasComment".

        You must also always keep track which part of the transcript you extracted the tension/feedback/(self)impression from and each tension/feedback/(self)impression and comment must be marked as ai generated. 

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
];

// Map Generation for Speaker to Roles based on first utterance
// export const roleSpeakerMappingTranscriptPrompt = `
//     Task: Create a JSON object mapping Speaker IDs to their roles based on their introduction sentence.

//     Input Context: You will receive a list where each line contains a "SPEAKER_XX" ID and their single introduction sentence.

//     Instructions:
//     1. **Role Extraction**: Analyze the German sentence to identify the speaker's role.
//        - Look for patterns like: "Ich bin [Rolle]", "Ich bin der [Rolle]", "Ich gehöre zu den [Rolle]", "Ich arbeite als [Rolle]".
//        - **Clean the Noun**: Remove adjectives (e.g., "behandelnder Arzt" -> "Arzt") and convert plurals to singular if necessary (e.g., "Physiotherapeuten" -> "Physiotherapeut").
//        - Use the original German word. Do not translate.

//     2. **ID Handling (Strict)**:
//        - You must create a key for **EVERY** Speaker ID provided in the input.
//        - Do not skip any ID.
//        - Do not invent any ID.
//        - Start with "Speaker_00" and continue sequentially (e.g., "Speaker_01", "Speaker_02", etc.). Do not deviate from this format.

//     3. **Value Formatting**:
//        - Format: "Role01".
//        - Counter: If a role appears multiple times, increment the number based on the order in the input (e.g., "Arzt01", "Arzt02").
//        - Fallback: If absolutely no role is mentioned in the sentence, use "Teilnehmer01".

//     Output Requirements:
//     - Return ONLY valid JSON.
//     - No markdown blocks (no \`\`\`json), no preamble.

//     Example Input:
//     SPEAKER_02: Also ich bin Physiotherapeut und finde das schlecht.
//     SPEAKER_05: Ich bin auf jeden Fall der Arzt hier.

//     Example Output:
//     {
//         "SPEAKER_02": "Physiotherapeut01",
//         "SPEAKER_05": "Arzt01"
//     }
// `;
export const roleSpeakerMappingTranscriptPrompt = `
    Task: Create a JSON mapping of speaker IDs to their identified roles.

    Instructions:
    - Identify Roles: For every unique speaker ID in the transcript
    - Role Numbering: Append "01" to the role name (e.g., "Doctor01"). If multiple people share a role, increment the number based on their first appearance (e.g., "Nurse01", "Nurse02").
    - Key Formatting: The JSON keys must follow the format "speaker_XX" where the speaker IDs must match exactly those in the input.

    Output Requirements:
    - It is important to only return *ONLY* a valid JSON object.
    - No preamble, no markdown blocks, and no additional text.

    Example Output:
    {
        "speaker_00": "Doctor02",
        "speaker_01": "Physiotherapist01"
    }
`;

export const ttlMergePrompts = [
    // merge prompt for entities
    `
        Given multiple Turtle Syntax inputs containing entities acting in a simulation scenario, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by combining the triples semantically and ensuring that there are no triples with duplicate meanings in the output.

        No new prefixes may be used.
        During this merging process no information must be lost!
        ${ttlOnlyInstruction}
    `,
    // merge prompt for tensions/comments
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
        ${ttlOnlyInstruction}
    `,

    // merge prompt for diarized transcript into existing tensions
    // todo check this prompt
    `
        Given a JSON array of speaker summaries from a medical simulation feedback session and existing Conflicts in Turtle Syntax, if a speaker expresses a tension, uncertainty, or critical feedback that is NOT yet in the "Existing TTL", check if it matches an existing Conflict. If it does, create a Comment linked via :HasComment to that Conflict. If it does not, create a new :Conflict.

        Output the final merged Conflicts and Comments in Turtle Syntax, generating titles and descriptions in German, English and Swedish for each tension/feedback/(self)impression:

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

        Output only the requested format, without any additional text or explanations.
        '''
    `,
];

// export const transcriptionMerge = [
//     `
//     You are a semantic expert for medical simulation data.

//     **Goal:** Analyze a "Transcribed Audio" (JSON) from a feedback session and generate NEW RDF triples (Turtle Syntax) representing conflicts, tensions, or comments.

//     **Inputs:**
//     1. **Context (Existing TTL):** The current state of the knowledge graph. Use this to identify existing Agents (e.g., :Physician01, :Instructor) and existing Conflicts.
//     2. **Transcript:** The diarized audio text.

//     **Instructions:**
//     - **Map Speakers:** Try to identify who is speaking based on the transcript labels (e.g., "SPEAKER_00") and the roles defined in the "Existing TTL". Use the predicate :WrittenBy to link to the correct entity (e.g., :Nurse01).
//     - **Create Conflicts:** If a speaker expresses a tension, uncertainty, or critical feedback that is NOT yet in the "Existing TTL", create a new :Conflict.
//     - **Create Comments:** If a speaker adds to a topic that looks like an existing conflict in the TTL, create a :Comment linked via :HasComment to that conflict.
//     - **No Duplicates:** Do NOT regenerate triples that are already in the "Existing TTL". Only output NEW information.
//     - **Format:** Output valid Turtle (TTL) syntax only. Use the same prefixes as the context.

//     **Output Template:**
//     '''turtle
//     ${ttlPrefixes}

//     :Conflict_Audio_Gen_1 a :Conflict ;
//         :ConflictTitle "Unclear medication instructions"@en ;
//         :ConflictDescription "The nurse felt the instructions were vague."@en ;
//         :ConflictState "open" ;
//         :WrittenBy :Nurse01 ;
//         :HasParticipant :Physician01 ;
//         :CreationDate "2024-..." ;
//         :IsAI true ;
//         :Origin "AudioTranscript" .
//     '''

//     Output only the requested Turtle Syntax, without any additional text or explanations.
//     `
// ];

// replace the constant prompt with a builder function
// export function buildAudioTranscriptionPrompt(sessionRoles: string[] = [], roleTypesOverride: string[] = roleTypes): string {
//     return `
//         Du bist ein Analyse-Assistent für medizinisches Training. Deine Aufgabe ist es, anonyme Sprecher (z.B. "SPEAKER_00", "SPEAKER_01") anhand des Kontexts einem Rollentyp zuzuordnen.
//         Die Szene ist ein Feedback-Gespräch nach einem Rollenspiel.
//         Die vollständige Liste der *möglichen* anwesenden Personen (falls relevant) ist: ${sessionRoles.join(', ')}.
//         Die 4 *Haupt-Rollentypen*, die du zuordnen sollst, sind: ${roleTypesOverride.join(', ')}.

//         Hier sind die Heuristiken zur Identifizierung der 4 Haupt-Rollentypen:
//         1.  **Lehrperson:** Moderiert, eröffnet/beendet die Runde, stellt Fragen (z.B. "Wie fandest du...", "Was denkst du..."), fasst zusammen. (Bezieht sich oft auf 'Ausbilder' oder 'Instructor' in der Rollenliste).
//         2.  **Schauspieler:** Spricht aus der Ich-Perspektive des Patienten (z.B. "Ich als Patient", "Ich habe gespürt...", "Ich fühlte mich..."). Spricht oft nur einmal.
//         3.  **Student (Actor):** Gibt eine Selbst-Einschätzung zur eigenen Leistung (z.B. "Ich war unsicher", "Ich habe versucht...", "Ich fand es schwierig..."). Dies ist die Person, die das Feedback erhält.
//         4.  **Observer (Student):** Gibt Feedback direkt an den Spieler in der "Du"-Form (z.B. "Du hast gut erklärt", "Du warst...", "Ich fand, du..."). Dies sind oft die meisten anderen Rollen (Arzt 01-04, Pflegekraft 01-04 etc.).

//         Analysiere den folgenden JSON-Input, der den gesamten Text pro Sprecher enthält.
//         Ordne JEDEM Sprecher einen der 4 Haupt-Rollentypen ("Teacher/Instructor", "Actor", "Student (Actor)", "Observer (Student)") UND einen Konfidenz-Score (high, medium, low) zu.

//         Gib deine Antwort NUR als valides JSON-Array im folgenden Format zurück. Fasse für 'reason' kurz zusammen, warum du dich entschieden hast:
//         [
//         { "speaker_id": "SPEAKER_00", "role": "Teacher/Instructor", "confidence": "high", "reason": "Stellt moderierende Fragen." },
//         { "speaker_id": "SPEAKER_01", "role": "Student (Actor)", "confidence": "medium", "reason": "Gibt Selbst-Einschätzung." }
//         ]
//     `;
// }
