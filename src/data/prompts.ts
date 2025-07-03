/* eslint-disable @typescript-eslint/no-unused-vars*/

import { vocab } from "./vocab";

const classExplanation1 = `
    "Subject" (individual or group of individuals of focus), "Object" (subject’s task or goal), "Instrument"
    (tools - tangible object and technology used), "Rule" (explicit or implicit rules), "Community" (social environments)
    or "DivisionOfLabour" (task division within the social environment).
`

const classExplanation2 = `
    - "Subject" (Who are the actors in the action? Family physician, Medical specialist, Nurse, Social worker, Carers etc. 
    What perceptions, ideas and emotions are present in the actors? Uncertainty, Discomfort, Incompetence etc.),

    - "Object" (What is the goal of the action? Cure, Care, adressing psychosocial issues etc. On whom or what is this action taken?
    Patient, Relative, Blood sample etc. What action must be taken? Needs assessment, Reporting, Decisionmaking etc.),

    - "Instrument" (What physical means are used in the action? Patient record, Chart, Medical device, Telephone etc.
    Which abstract resources are deployed in the action? Conviction, Proactivity, Instruction etc.),

    - "Rule" (Which specific policies and rules are linked to the activity? Guidelines, Authorisation, Reimbursements, Co-location etc.
    What implicit mores and conventions are linked to the activity? Priority, Career track, Professional jargon etc.),

    - "Community" (Where does the activity take place? Home, Nursing home, Hospital etc. What organisation do the actors belong to?
    General University hospital, Independent Municipal health care practice etc. What conditions characterise this setting?
    Immediate needs, Distance, Shortage etc.)

    - "DivisionOfLabour" (How can different people contribute to the activity? Hierarchy, Role, Leadership, Territorial attitude etc.).
`

const rawBasePrompt = `
    Given any text, you'll extract the most important entities and relations, and create a knowledge graph in Turtle Syntax from it.
    
    All extracted entities must be assigned the general class "owl:NamedIndividual" as well as one or multiple of the following classes
    according to their context in the given situation:
    ${classExplanation2}

    You should also extract all important conflicts, feedbacks and impressions between/of the entities. 
    The extracted conflicts/feedbacks/impressionss/impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
    a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
    given entities that initiated the conflict/feedback/impressions/impressions. If entities are involved in a conflict/feedback/impression, they must be linked
    with the relation "HasParticipant" with the conflict/feedback/impressions/impressions as the source entity. A conflict/feedback/impressions/impressions must not have paricipants from
    more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
    combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
    combinations of three classes are not allowed!
    If the participants belong to just one  or two classes, the classes may be chosen freely.   
    
    If other entities respond to a conflict/feedback/impressions/impressions, they must be represented as a new entity of the "Comment" class and linked
    from the conflict/feedback/impressions/impressions with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
    ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impressions/impressions.
    The comments may have further comments which must also be linked in the same way using "HasComment".

    All Descriptions and Titles should be translated into German, English and Swedish.

    The user input itself must also represented as an entitiy by extracting a name and a sunmmarized description, both in German, English and Swedish
    for the general present setting. They must both be represented with the same single unique identifier, the relations "ActivityDescription"
    and "ActivityName" and fitting Text as the target.

    Only the following prefixes are allowed in your Turtle Syntax:
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
`

const personaBasePrompt = `
    You're an experienced expert in the field of knowledge graph generation from natural texts.
    Given any text, you're able to extract the most important entities and relations, and create
    a knowledge graph in Turtle Syntax from it.
    All extracted entities must be assigned the general class "owl:NamedIndividual" as well as one or multiple of the following classes
    according to their context in the given situation:
    ${classExplanation2}

    You should also extract all important conflicts, feedbacks and impressions between/of the entities. 
    The extracted conflicts/feedbacks/impressionss/impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
    a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy")
    who must be one of the given entities that initiated the conflict/feedback/impression.
    If entities are involved in a conflict/feedback/impression, they must be linked
    with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have paricipants from
    more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
    combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
    combinations of three classes are not allowed!
    If the participants belong to just one or two classes, the classes may be chosen freely. 
    
    If other entities respond to a conflict/feedback/impression, they must be represented as a new entity of the "Comment" class and linked
    from the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier, a description which must not be a direct quote
    ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
    The comments may have further comments which must also be linked in the same way using "HasComment".

        All Descriptions and Titles should be translated into German, English and Swedish.

    The user input itself must also represented as an entitiy by extracting a name and a sunmmarized description, both in German, English and Swedish
    for the general present setting. They must both be represented with the same single unique identifier, the relations "ActivityDescription"
    and "ActivityName" and fitting Text as the target.

    Only the following prefixes are allowed in your Turtle Syntax:
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
`;

const vocabInstruction = `
    During the generation process, you have access to the following vocabulary. If possible, use the relations from it to describe 
    the interactions in the given text. Only deviate from it if situations present in the text cannot be described with the vocabulary. 
    Defintitions of used vocabulary must not be included in the final output. 
    Vocabulary: ${vocab}
`

const ttlOnlyInsctruction = `
    Make sure to generate a graph that is as complete but also as concise as possible.
    Output only the knowledge graph in Turtle Syntax, without any additional text or explanations.
`;

const example_setting_extraction = `
    Here's an example:
    User Input:
    "
        Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
        Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."
    "
    Output:
    "
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        :InterprofessionalConflictHomeCare a owl:NamedIndividual ;
        :ActivityDescription "A critical incident in home-based palliative care, illustrating a severe communication breakdown and conflict between a homecare nurse and a family physician regarding patient management, medication dosage, and professional responsibilities, leading to patient abandonment and family distress."@en ;
        :ActivityDescription "Ein kritischer Vorfall in der häuslichen Palliativversorgung, der eine schwere Kommunikationsstörung und einen Konflikt zwischen einer häuslichen Pflegekraft und einem Hausarzt bezüglich Patientenmanagement, Medikamentendosierung und beruflicher Verantwortung aufzeigt, was zur Patientenverlassenheit und familiärem Leid führte."@de ;
        :ActivityDescription "En kritisk incident inom palliativ hemsjukvård, som illustrerar en allvarlig kommunikationsbrist och konflikt mellan en hemsjuksköterska och en familjeläkare angående patienthantering, medicindosering och professionella ansvarsområden, vilket ledde till att patienten övergavs och familjen upplevde nöd."@sv ;
        :ActivityName "Interprofessional Conflict in Home Care"@en ;
        :ActivityName "Interprofessioneller Konflikt in der häuslichen Pflege"@de ;
        :ActivityName "Interprofessionell konflikt inom hemsjukvården"@sv .
    "
`

const example_entity_extraction = `
    Here's an example:
    User Input:
    "
        Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
        Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."
    "
    Output:
    "
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :HomecareNurse a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Homecare nurse"@en,
                    "Häusliche Pflegekraft"@de,
                    "Hemvårdssjuksköterska"@sv .

        :GeneralPractitioner a :Subject, :Community,
            owl:NamedIndividual ;
            rdfs:label "General Practitioner"@en,
                    "Hausarzt"@de,
                    "Allmänläkare"@sv .

        :Patient a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Patient"@en,
                    "Patient"@de,
                    "Patient"@sv .

        :VenaCavaSuperiorSyndrome a :Object,
            owl:NamedIndividual ;
            rdfs:label "Vena Cava Superior Syndrome"@en,
                    "Vena-cava-superior-Syndrom"@de,
                    "Vena Cava Superior-syndrom"@sv .

        :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative Home Care Team"@en,
                    "Palliativ-Häusliche-Pflege-Team"@de,
                    "Palliativt hemsjukvårdsteam"@sv .

        :PhoneCalls a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Phone calls"@en,
                    "Telefonanrufe"@de,
                    "Telefonsamtal"@sv .

        :Medications a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Medications"@en,
                    "Medikamente"@de,
                    "Läkemedel"@sv .

        :Suffocation a :Object,
            owl:NamedIndividual ;
            rdfs:label "Suffocation"@en,
                    "Ersticken"@de,
                    "Kvävning"@sv .

        :ElderlyHome a :Community,
            owl:NamedIndividual ;
            rdfs:label "Elderly home"@en,
                    "Altenheim"@de,
                    "Äldreboende"@sv .

        :PalliativeCareNurse a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative care nurse"@en,
                    "Palliativpflegerin"@de,
                    "Palliativ sjuksköterska"@sv .

        :MedicationDoses a :Object,
            owl:NamedIndividual ;
            rdfs:label "Medication doses"@en,
                    "Medikamentendosierungen"@de,
                    "Läkemedelsdoser"@sv .

        :Anesthetist a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Anesthetist"@en,
                    "Anästhesist"@de,
                    "Anestesiolog"@sv .

        :Hospital a :Community,
            owl:NamedIndividual ;
            rdfs:label "Hospital"@en,
                    "Krankenhaus"@de,
                    "Sjukhus"@sv .

        :Family a :Community,
            owl:NamedIndividual ;
            rdfs:label "Family"@en,
                    "Familie"@de,
                    "Familj"@sv .

        :ConflictOfCompetences a :Object,
            owl:NamedIndividual ;
            rdfs:label "Conflict of competences"@en,
                    "Kompetenzkonflikt"@de,
                    "Kompetenskonflikt"@sv .

        :Chaos a :Object,
            owl:NamedIndividual ;
            rdfs:label "Chaos"@en,
                    "Chaos"@de,
                    "Kaos"@sv .
    "
`

const example_property_extraction = `
    Here's an example:

    User Input:
    "
        Text: 'Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
        Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."'
        Entities: '''turtle
            @prefix : <http://activate.htwk-leipzig.de/model#> .
            @prefix owl: <http://www.w3.org/2002/07/owl#> .
            @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
            @base <http://activate.htwk-leipzig.de/model> .

            :HomecareNurse a :Subject,
                owl:NamedIndividual ;
                rdfs:label "Homecare nurse"@en,
                        "Häusliche Pflegekraft"@de,
                        "Hemvårdssjuksköterska"@sv .

            :GeneralPractitioner a :Subject, :Community,
                owl:NamedIndividual ;
                rdfs:label "General Practitioner"@en,
                        "Hausarzt"@de,
                        "Allmänläkare"@sv .

            :Patient a :Subject,
                owl:NamedIndividual ;
                rdfs:label "Patient"@en,
                        "Patient"@de,
                        "Patient"@sv .

            :VenaCavaSuperiorSyndrome a :Object,
                owl:NamedIndividual ;
                rdfs:label "Vena Cava Superior Syndrome"@en,
                        "Vena-cava-superior-Syndrom"@de,
                        "Vena Cava Superior-syndrom"@sv .

            :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
                owl:NamedIndividual ;
                rdfs:label "Palliative Home Care Team"@en,
                        "Palliativ-Häusliche-Pflege-Team"@de,
                        "Palliativt hemsjukvårdsteam"@sv .

            :PhoneCalls a :Instrument,
                owl:NamedIndividual ;
                rdfs:label "Phone calls"@en,
                        "Telefonanrufe"@de,
                        "Telefonsamtal"@sv .

            :Medications a :Instrument,
                owl:NamedIndividual ;
                rdfs:label "Medications"@en,
                        "Medikamente"@de,
                        "Läkemedel"@sv .

            :Suffocation a :Object,
                owl:NamedIndividual ;
                rdfs:label "Suffocation"@en,
                        "Ersticken"@de,
                        "Kvävning"@sv .

            :ElderlyHome a :Community,
                owl:NamedIndividual ;
                rdfs:label "Elderly home"@en,
                        "Altenheim"@de,
                        "Äldreboende"@sv .

            :PalliativeCareNurse a :Subject, :DivisionOfLabour,
                owl:NamedIndividual ;
                rdfs:label "Palliative care nurse"@en,
                        "Palliativpflegerin"@de,
                        "Palliativ sjuksköterska"@sv .

            :MedicationDoses a :Object,
                owl:NamedIndividual ;
                rdfs:label "Medication doses"@en,
                        "Medikamentendosierungen"@de,
                        "Läkemedelsdoser"@sv .

            :Anesthetist a :Subject, :DivisionOfLabour,
                owl:NamedIndividual ;
                rdfs:label "Anesthetist"@en,
                        "Anästhesist"@de,
                        "Anestesiolog"@sv .

            :Hospital a :Community,
                owl:NamedIndividual ;
                rdfs:label "Hospital"@en,
                        "Krankenhaus"@de,
                        "Sjukhus"@sv .

            :Family a :Community,
                owl:NamedIndividual ;
                rdfs:label "Family"@en,
                        "Familie"@de,
                        "Familj"@sv .

            :ConflictOfCompetences a :Object,
                owl:NamedIndividual ;
                rdfs:label "Conflict of competences"@en,
                        "Kompetenzkonflikt"@de,
                        "Kompetenskonflikt"@sv .

            :Chaos a :Object,
                owl:NamedIndividual ;
                rdfs:label "Chaos"@en,
                        "Chaos"@de,
                        "Kaos"@sv .
        '''
    "

    Output:
    "
        @prefix : <http://activate.htwk-leipzig.de/model#> .    
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :HomecareNurse a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Homecare nurse"@en,
                    "Häusliche Pflegekraft"@de,
                    "Hemvårdssjuksköterska"@sv ;
            :SubjectName "Homecare nurse" .

        :GeneralPractitioner a :Subject, :Community,
            owl:NamedIndividual ;
            rdfs:label "General Practitioner"@en,
                    "Hausarzt"@de,
                    "Allmänläkare"@sv ;
            :SubjectName "General Practitioner" ;
            :SubjectSex "Male" .

        :Patient a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Patient"@en,
                    "Patient"@de,
                    "Patient"@sv ;
            :SubjectName "patient" ;
            :SubjectSex "Male" ;
            :SubjectAge "elderly" .

        :VenaCavaSuperiorSyndrome a :Object,
            owl:NamedIndividual ;
            rdfs:label "Vena Cava Superior Syndrome"@en,
                    "Vena-cava-superior-Syndrom"@de,
                    "Vena Cava Superior-syndrom"@sv .

        :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative Home Care Team"@en,
                    "Palliativ-Häusliche-Pflege-Team"@de,
                    "Palliativt hemsjukvårdsteam"@sv .

        :PhoneCalls a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Phone calls"@en,
                    "Telefonanrufe"@de,
                    "Telefonsamtal"@sv ;
            :InstrumentName "phone calls" ;
            :InstrumentType "communication instrument" ;
            :InstrumentDescription "not suitable for urgent situations" .

        :Medications a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Medications"@en,
                    "Medikamente"@de,
                    "Läkemedel"@sv ;
            :InstrumentName "medications" ;
            :InstrumentType "drug" ;
            :InstrumentDescription "used to make the patient comfortable" .

        :Suffocation a :Object,
            owl:NamedIndividual ;
            rdfs:label "Suffocation"@en,
                    "Ersticken"@de,
                    "Kvävning"@sv .

        :ElderlyHome a :Community,
            owl:NamedIndividual ;
            rdfs:label "Elderly home"@en,
                    "Altenheim"@de,
                    "Äldreboende"@sv .

        :PalliativeCareNurse a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative care nurse"@en,
                    "Palliativpflegerin"@de,
                    "Palliativ sjuksköterska"@sv ;
            :SubjectName "palliative care nurse" ;
            :SubjectSex "Female" .

        :MedicationDoses a :Object,
            owl:NamedIndividual ;
            rdfs:label "Medication doses"@en,
                    "Medikamentendosierungen"@de,
                    "Läkemedelsdoser"@sv .

        :Anesthetist a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Anesthetist"@en,
                    "Anästhesist"@de,
                    "Anestesiolog"@sv ;
            :SubjectName "anesthetist" .

        :Hospital a :Community,
            owl:NamedIndividual ;
            rdfs:label "Hospital"@en,
                    "Krankenhaus"@de,
                    "Sjukhus"@sv .

        :Family a :Community,
            owl:NamedIndividual ;
            rdfs:label "Family"@en,
                    "Familie"@de,
                    "Familj"@sv .

        :ConflictOfCompetences a :Object,
            owl:NamedIndividual ;
            rdfs:label "Conflict of competences"@en,
                    "Kompetenzkonflikt"@de,
                    "Kompetenskonflikt"@sv .

        :Chaos a :Object,
            owl:NamedIndividual ;
            rdfs:label "Chaos"@en,
                    "Chaos"@de,
                    "Kaos"@sv .
    "
`

const example_relation_extraction = `
    Here's an example: 

User Input:
    "
    Text: 'Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
    Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."'
    Entities: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .    
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :HomecareNurse a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Homecare nurse"@en,
                    "Häusliche Pflegekraft"@de,
                    "Hemvårdssjuksköterska"@sv ;
            :SubjectName "Homecare nurse" .

        :GeneralPractitioner a :Subject, :Community,
            owl:NamedIndividual ;
            rdfs:label "General Practitioner"@en,
                    "Hausarzt"@de,
                    "Allmänläkare"@sv ;
            :SubjectName "General Practitioner" ;
            :SubjectSex "Male" .

        :Patient a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Patient"@en,
                    "Patient"@de,
                    "Patient"@sv ;
            :SubjectName "patient" ;
            :SubjectSex "Male" ;
            :SubjectAge "elderly" .

        :VenaCavaSuperiorSyndrome a :Object,
            owl:NamedIndividual ;
            rdfs:label "Vena Cava Superior Syndrome"@en,
                    "Vena-cava-superior-Syndrom"@de,
                    "Vena Cava Superior-syndrom"@sv .

        :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative Home Care Team"@en,
                    "Palliativ-Häusliche-Pflege-Team"@de,
                    "Palliativt hemsjukvårdsteam"@sv .

        :PhoneCalls a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Phone calls"@en,
                    "Telefonanrufe"@de,
                    "Telefonsamtal"@sv ;
            :InstrumentName "phone calls" ;
            :InstrumentType "communication instrument" ;
            :InstrumentDescription "not suitable for urgent situations" .

        :Medications a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Medications"@en,
                    "Medikamente"@de,
                    "Läkemedel"@sv ;
            :InstrumentName "medications" ;
            :InstrumentType "drug" ;
            :InstrumentDescription "used to make the patient comfortable" .

        :Suffocation a :Object,
            owl:NamedIndividual ;
            rdfs:label "Suffocation"@en,
                    "Ersticken"@de,
                    "Kvävning"@sv .

        :ElderlyHome a :Community,
            owl:NamedIndividual ;
            rdfs:label "Elderly home"@en,
                    "Altenheim"@de,
                    "Äldreboende"@sv .

        :PalliativeCareNurse a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative care nurse"@en,
                    "Palliativpflegerin"@de,
                    "Palliativ sjuksköterska"@sv ;
            :SubjectName "palliative care nurse" ;
            :SubjectSex "Female" .

        :MedicationDoses a :Object,
            owl:NamedIndividual ;
            rdfs:label "Medication doses"@en,
                    "Medikamentendosierungen"@de,
                    "Läkemedelsdoser"@sv .

        :Anesthetist a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Anesthetist"@en,
                    "Anästhesist"@de,
                    "Anestesiolog"@sv ;
            :SubjectName "anesthetist" .

        :Hospital a :Community,
            owl:NamedIndividual ;
            rdfs:label "Hospital"@en,
                    "Krankenhaus"@de,
                    "Sjukhus"@sv .

        :Family a :Community,
            owl:NamedIndividual ;
            rdfs:label "Family"@en,
                    "Familie"@de,
                    "Familj"@sv .

        :ConflictOfCompetences a :Object,
            owl:NamedIndividual ;
            rdfs:label "Conflict of competences"@en,
                    "Kompetenzkonflikt"@de,
                    "Kompetenskonflikt"@sv .

        :Chaos a :Object,
            owl:NamedIndividual ;
            rdfs:label "Chaos"@en,
                    "Chaos"@de,
                    "Kaos"@sv .
    '''
    "

    Output:
    "
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :IsInvolvedInConflict rdf:type owl:ObjectProperty ;
        rdfs:domain :Subject ;
        rdfs:range :Object ;
        rdfs:label "Is involved in conflict"@en ,
                "Ist in Konflikt involviert"@de ,
                "Är involverad i konflikt"@sv .

    :Prescribes rdf:type owl:ObjectProperty ;
        rdfs:domain :Subject ;
        rdfs:range :Object ;
        rdfs:label "Prescribes"@en ,
                "Verschreibt"@de ,
                "Förskriver"@sv .

    :HomecareNurse a :Subject,
        owl:NamedIndividual ;
        rdfs:label "Homecare nurse"@en,
                "Häusliche Pflegekraft"@de,
                "Hemvårdssjuksköterska"@sv ;
        :SubjectName "Homecare nurse" ;
        :InteractsIn :GeneralPractitioner ;
        :InteractsIn :PalliativeHomeCareTeam .

    :GeneralPractitioner a :Subject, :Community,
        owl:NamedIndividual ;
        rdfs:label "General Practitioner"@en,
                "Hausarzt"@de,
                "Allmänläkare"@sv ;
        :SubjectName "General Practitioner" ;
        :SubjectSex "Male" ;
        :Prescribes :MedicationDoses ;
        :InteractsWith :Anesthetist ;
        :IsInvolvedInConflict :ConflictOfCompetences .

    :Patient a :Subject,
        owl:NamedIndividual ;
        rdfs:label "Patient"@en,
                "Patient"@de,
                "Patient"@sv ;
        :SubjectName "patient" ;
        :SubjectSex "Male" ;
        :SubjectAge "elderly" .

    :VenaCavaSuperiorSyndrome a :Object,
        owl:NamedIndividual ;
        rdfs:label "Vena Cava Superior Syndrome"@en,
                "Vena-cava-superior-Syndrom"@de,
                "Vena Cava Superior-syndrom"@sv .

    :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
        owl:NamedIndividual ;
        rdfs:label "Palliative Home Care Team"@en,
                "Palliativ-Häusliche-Pflege-Team"@de,
                "Palliativt hemsjukvårdsteam"@sv .

    :PhoneCalls a :Instrument,
        owl:NamedIndividual ;
        rdfs:label "Phone calls"@en,
                "Telefonanrufe"@de,
                "Telefonsamtal"@sv ;
        :InstrumentName "phone calls" ;
        :InstrumentType "communication instrument" ;
        :InstrumentDescription "not suitable for urgent situations" .

    :Medications a :Instrument,
        owl:NamedIndividual ;
        rdfs:label "Medications"@en,
                "Medikamente"@de,
                "Läkemedel"@sv ;
        :InstrumentName "medications" ;
        :InstrumentType "drug" ;
        :InstrumentDescription "used to make the patient comfortable" ;
        :IsUsedOn :Patient .

    :Suffocation a :Object,
        owl:NamedIndividual ;
        rdfs:label "Suffocation"@en,
                "Ersticken"@de,
                "Kvävning"@sv .

    :ElderlyHome a :Community,
        owl:NamedIndividual ;
        rdfs:label "Elderly home"@en,
                "Altenheim"@de,
                "Äldreboende"@sv ;
        :InteractsWith :GeneralPractitioner .

    :PalliativeCareNurse a :Subject, :DivisionOfLabour,
        owl:NamedIndividual ;
        rdfs:label "Palliative care nurse"@en,
                "Palliativpflegerin"@de,
                "Palliativ sjuksköterska"@sv ;
        :SubjectName "palliative care nurse" ;
        :SubjectSex "Female" ;
        :IsInvolvedInConflict :ConflictOfCompetences .

    :MedicationDoses a :Object,
        owl:NamedIndividual ;
        rdfs:label "Medication doses"@en,
                "Medikamentendosierungen"@de,
                "Läkemedelsdoser"@sv .

    :Anesthetist a :Subject, :DivisionOfLabour,
        owl:NamedIndividual ;
        rdfs:label "Anesthetist"@en,
                "Anästhesist"@de,
                "Anestesiolog"@sv ;
        :SubjectName "anesthetist" ;
        :OperatesOn :Patient ;
        :InteractsIn :Hospital .

    :Hospital a :Community,
        owl:NamedIndividual ;
        rdfs:label "Hospital"@en,
                "Krankenhaus"@de,
                "Sjukhus"@sv .

    :Family a :Community,
        owl:NamedIndividual ;
        rdfs:label "Family"@en,
                "Familie"@de,
                "Familj"@sv ;
        :Shares :Chaos .

    :ConflictOfCompetences a :Object,
        owl:NamedIndividual ;
        rdfs:label "Conflict of competences"@en,
                "Kompetenzkonflikt"@de,
                "Kompetenskonflikt"@sv .

    :Chaos a :Object,
        owl:NamedIndividual ;
        rdfs:label "Chaos"@en,
                "Chaos"@de,
                "Kaos"@sv .
    "
`

const example_conflict_extraction = `
    Here's an example:

    User Input:
    "
    Text: 'Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
    Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."'
    Data: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :IsInvolvedInConflict rdf:type owl:ObjectProperty ;
            rdfs:domain :Subject ;
            rdfs:range :Object ;
            rdfs:label "Is involved in conflict"@en ,
                    "Ist in Konflikt involviert"@de ,
                    "Är involverad i konflikt"@sv .

        :Prescribes rdf:type owl:ObjectProperty ;
            rdfs:domain :Subject ;
            rdfs:range :Object ;
            rdfs:label "Prescribes"@en ,
                    "Verschreibt"@de ,
                    "Förskriver"@sv .

        :HomecareNurse a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Homecare nurse"@en,
                    "Häusliche Pflegekraft"@de,
                    "Hemvårdssjuksköterska"@sv ;
            :SubjectName "Homecare nurse" ;
            :InteractsIn :GeneralPractitioner ;
            :InteractsIn :PalliativeHomeCareTeam .

        :GeneralPractitioner a :Subject, :Community,
            owl:NamedIndividual ;
            rdfs:label "General Practitioner"@en,
                    "Hausarzt"@de,
                    "Allmänläkare"@sv ;
            :SubjectName "General Practitioner" ;
            :SubjectSex "Male" ;
            :Prescribes :MedicationDoses ;
            :InteractsWith :Anesthetist ;
            :IsInvolvedInConflict :ConflictOfCompetences .

        :Patient a :Subject,
            owl:NamedIndividual ;
            rdfs:label "Patient"@en,
                    "Patient"@de,
                    "Patient"@sv ;
            :SubjectName "patient" ;
            :SubjectSex "Male" ;
            :SubjectAge "elderly" .

        :VenaCavaSuperiorSyndrome a :Object,
            owl:NamedIndividual ;
            rdfs:label "Vena Cava Superior Syndrome"@en,
                    "Vena-cava-superior-Syndrom"@de,
                    "Vena Cava Superior-syndrom"@sv .

        :PalliativeHomeCareTeam a :Community, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative Home Care Team"@en,
                    "Palliativ-Häusliche-Pflege-Team"@de,
                    "Palliativt hemsjukvårdsteam"@sv .

        :PhoneCalls a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Phone calls"@en,
                    "Telefonanrufe"@de,
                    "Telefonsamtal"@sv ;
            :InstrumentName "phone calls" ;
            :InstrumentType "communication instrument" ;
            :InstrumentDescription "not suitable for urgent situations" .

        :Medications a :Instrument,
            owl:NamedIndividual ;
            rdfs:label "Medications"@en,
                    "Medikamente"@de,
                    "Läkemedel"@sv ;
            :InstrumentName "medications" ;
            :InstrumentType "drug" ;
            :InstrumentDescription "used to make the patient comfortable" ;
            :IsUsedOn :Patient .

        :Suffocation a :Object,
            owl:NamedIndividual ;
            rdfs:label "Suffocation"@en,
                    "Ersticken"@de,
                    "Kvävning"@sv .

        :ElderlyHome a :Community,
            owl:NamedIndividual ;
            rdfs:label "Elderly home"@en,
                    "Altenheim"@de,
                    "Äldreboende"@sv ;
            :InteractsWith :GeneralPractitioner .

        :PalliativeCareNurse a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Palliative care nurse"@en,
                    "Palliativpflegerin"@de,
                    "Palliativ sjuksköterska"@sv ;
            :SubjectName "palliative care nurse" ;
            :SubjectSex "Female" ;
            :IsInvolvedInConflict :ConflictOfCompetences .

        :MedicationDoses a :Object,
            owl:NamedIndividual ;
            rdfs:label "Medication doses"@en,
                    "Medikamentendosierungen"@de,
                    "Läkemedelsdoser"@sv .

        :Anesthetist a :Subject, :DivisionOfLabour,
            owl:NamedIndividual ;
            rdfs:label "Anesthetist"@en,
                    "Anästhesist"@de,
                    "Anestesiolog"@sv ;
            :SubjectName "anesthetist" ;
            :OperatesOn :Patient ;
            :InteractsIn :Hospital .

        :Hospital a :Community,
            owl:NamedIndividual ;
            rdfs:label "Hospital"@en,
                    "Krankenhaus"@de,
                    "Sjukhus"@sv .

        :Family a :Community,
            owl:NamedIndividual ;
            rdfs:label "Family"@en,
                    "Familie"@de,
                    "Familj"@sv ;
            :Shares :Chaos .

        :ConflictOfCompetences a :Object,
            owl:NamedIndividual ;
            rdfs:label "Conflict of competences"@en,
                    "Kompetenzkonflikt"@de,
                    "Kompetenskonflikt"@sv .

        :Chaos a :Object,
            owl:NamedIndividual ;
            rdfs:label "Chaos"@en,
                    "Chaos"@de,
                    "Kaos"@sv .
    '''
    "

    Output: 
    "
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :conflict_gp_emergency_preparedness a :Conflict ;
        :ConflictTitle "GP's Inadequate Emergency Advice"@en ;
        :ConflictTitle "Unzureichende Notfallberatung durch den Hausarzt"@de ;
        :ConflictTitle "Allmänläkares otillräckliga råd vid nödsituationer"@sv ;
        :ConflictDescription "The homecare nurse expresses concern and dissatisfaction with the general practitioner's advice regarding a patient suffering from Vena Cava Superior Syndrome, particularly the GP's perceived lack of knowledge and insufficient guidance for emergency situations like suffocation, where immediate action is required rather than phone calls."@en ;
        :ConflictDescription "Die häusliche Pflegekraft äußert Bedenken und Unzufriedenheit über die Ratschläge des Hausarztes bezüglich eines Patienten mit Vena-cava-superior-Syndrom, insbesondere über die wahrgenommene mangelnde Kenntnis des Hausarztes und unzureichende Anleitung für Notfallsituationen wie Ersticken, bei denen sofortiges Handeln statt Telefonanrufen erforderlich ist."@de ;
        :ConflictDescription "Hemvårdssjuksköterskan uttrycker oro och missnöje med allmänläkarens råd gällande en patient som lider av Vena Cava Superior-syndrom, särskilt allmänläkarens upplevda brist på kunskap och otillräckliga vägledning för nödsituationer som kvävning, där omedelbar åtgärd krävs snarare än telefonsamtal."@sv ;
        :ConflictState "open" ;
        :WrittenBy :HomecareNurse ;
        :HasParticipant :HomecareNurse ;
        :HasParticipant :GeneralPractitioner ;
        :HasParticipant :Patient ;
        :HasParticipant :VenaCavaSuperiorSyndrome ;
        :HasParticipant :PhoneCalls ;
        :HasParticipant :Suffocation ;
        :CreationDate "2024-06-01T10:00:00Z" .

    :conflict_pcn_medication_refusal a :Conflict ;
        :ConflictTitle "Palliative Care Nurse Refuses Medication Administration"@en ;
        :ConflictTitle "Palliativpflegerin verweigert Medikamentenverabreichung"@de ;
        :ConflictTitle "Palliativ sjuksköterska vägrar medicinering"@sv ;
        :ConflictDescription "The general practitioner reports a conflict where the palliative care nurse refused to administer prescribed medications, citing concerns about high dosages, and subsequently left the patient without providing care, leading to distress and chaos observed by the patient's family."@en ;
        :ConflictDescription "Der Hausarzt berichtet von einem Konflikt, bei dem die Palliativpflegerin die Verabreichung verschriebener Medikamente verweigerte, unter Berufung auf Bedenken wegen hoher Dosierungen, und den Patienten anschließend ohne Versorgung verließ, was bei der Familie des Patienten zu Bestürzung und Chaos führte."@de ;
        :ConflictDescription "Allmänläkaren rapporterar en konflikt där den pallativa sjuksköterskan vägrade att administrera ordinerade mediciner, med hänvisning till oro över höga doser, och därefter lämnade patienten utan att ge vård, vilket ledde till oro och kaos som observerades av patientens familj."@sv ;
        :ConflictState "open" ;
        :WrittenBy :GeneralPractitioner ;
        :HasParticipant :GeneralPractitioner ;
        :HasParticipant :PalliativeCareNurse ;
        :HasParticipant :MedicationDoses ;
        :HasParticipant :Patient ;
        :HasParticipant :Family ;
        :CreationDate "2024-06-01T10:05:00Z" .
    "
`

const example_small = `
    Here's an example:
    User Input:
    "
        Homecare nurse: I called this GP and I told him “Doctor, this patient suffers from the vena cava superior syndrome, and I”m not experienced in this'. “Oh but you don”t have to worry about that…' was the answer! He didn't know it either, I guess, otherwise you don't say such a thing. That wasn't helping me at all. And then I'm glad the palliative home care team was there because these people are more knowledgeable and experienced. I was afraid the patient would suffocate, and then what? So I consulted the GP and asked him “What can we do if this happens?” “Well, then you just call me”, he said. But you know, if something like this is happening, you don't have time to make phone calls, you know, you need to be able to do something. But they (GPs) don't always understand…
        Family physician: One hour later I got a telephone call from the elderly home: 'yes, the palliative care nurse refuses to do that.' I say 'she refuses?!' 'Yes, she says that the doses you prescribed are too high.' I say 'okay, I'm going to calculate again, and I'll get advice from the anesthetist who cared for the patient in the hospital.' I call back and say 'the patient is going to die within 24 h so you should give the medications to make him comfortable'... she left without doing anything. She abandoned the patient. Kind of unnecessary conflict of competences. And the family was amazed: such chaos!."
    "
    Output:
    "
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        :117605f7035ca3877c384eb71bfa14fb786bcf86 a :Conflict ;
        :ConflictDescription "A homecare nurse described calling a GP about a patient with superior vena cava syndrome, but the GP was unhelpful and seemed unfamiliar with the condition. The nurse felt unsupported and feared the patient might suffocate. She was relieved the palliative care team was available, as they were more experienced. She criticized GPs for not understanding the urgency in such situations."@en ;
        :ConflictDescription "Eine ambulante Pflegekraft berichtete, dass sie wegen eines Patienten mit Vena-cava-superior-Syndrom den Hausarzt kontaktierte, dieser aber keine Hilfe war und offenbar die Krankheit nicht kannte. Die Pflegekraft fühlte sich im Stich gelassen und hatte Angst, der Patient könnte ersticken. Sie war erleichtert, dass das Palliativteam verfügbar war, da es erfahrener ist. Sie kritisierte, dass Hausärzte die Dringlichkeit solcher Situationen oft nicht verstehen."@de ;
        :ConflictDescription "En hemsjuksköterska berättade att hon kontaktade en husläkare om en patient med vena cava superior-syndrom, men läkaren var inte till någon hjälp och verkade inte känna till tillståndet. Sjuksköterskan kände sig övergiven och var rädd att patienten skulle kvävas. Hon var lättad över att det palliativa teamet fanns tillgängligt eftersom de var mer erfarna. Hon kritiserade att husläkare ofta inte förstår allvaret i sådana situationer."@sv ;
        :ConflictState "open" ;
        :ConflictTitle "Telephone calls"@en ;
        :ConflictTitle "Telefonanrufe"@de ;
        :ConflictTitle "Telefonsamtal"@sv ;
        :CreationDate "2025-05-20T10:30:36.715Z" ;
        :HasParticipant :Generalist,
            :Home,
            :Homecare_Nurse,
            :Understanding ;
        :WrittenBy "Homecare Nurse" .

        :83bdd967717092b12efbfdd459fc38919dd7e3b7 a :Conflict ;
        :ConflictDescription "A family physician recalls a conflict where a palliative nurse refused to give prescribed medication, claiming the doses were too high. The doctor recalculated and consulted an anesthetist, confirming the need. Still, the nurse left without acting, leaving the patient and causing distress to the family."@en ;
        :ConflictDescription "Ein Hausarzt berichtet von einem Konflikt, bei dem eine Palliativpflegerin die verschriebene Medikation verweigerte, da sie die Dosierung für zu hoch hielt. Der Arzt rechnete neu und holte Rat von einem Anästhesisten ein, bestätigte die Notwendigkeit – doch die Pflegekraft handelte nicht und ließ den Patienten allein, was die Familie schockierte."@de ;
        :ConflictDescription "En husläkare berättar om en konflikt där en palliativsjuksköterska vägrade ge den ordinerade medicinen eftersom doserna ansågs för höga. Läkaren räknade om, rådfrågade en anestesiolog och bekräftade behovet – ändå lämnade sjuksköterskan patienten, vilket upprörde familjen."@sv .
        :ConflictState "open" ;
        :ConflictTitle "Delegate via telephone"@en ;
        :ConflictTitle "Delegieren per Telefon"@de ;
        :ConflictTitle "Delegera via telefon"@sv ;
        :CreationDate "2025-05-20T10:37:17.279Z" ;
        :HasParticipant :Delegate_Explicit_Transfer,
            :Delivering_Care,
            :Nursing_Home ;
        :WrittenBy "Generalist" .

        :Generalist a :Subject,
                owl:NamedIndividual ;
            rdfs:label "Medical Practitioners/Generalist"@en ;
            rdfs:label "Ärztliche Fachpersonen/Allgemeinmediziner"@de ;
            rdfs:label "Läkare/Allmänläkare"@sv .

        :Home a :Community,
                owl:NamedIndividual ;
            rdfs:label "Setting/Home"@en ;
            rdfs:label "Versorgungsort/Zuhause"@de ;
            rdfs:label "Vårdplats/Hemmet"@sv .

        :Homecare_Nurse a :Subject,
                owl:NamedIndividual ;
            rdfs:label "Other Healthcare Professionals/Nurse/Homecare Nurse"@en ;
            rdfs:label "Weitere Gesundheitsfachpersonen/Pflegekraft/Hauskrankenpflege"@de ;
            rdfs:label "Andra vårdpersonal/Sjuksköterska/Hemsjukvård"@sv .

        :Understanding a :Rule,
                owl:NamedIndividual ;
            rdfs:label "Interaction/Understanding"@en ;
            rdfs:label "Interaktion/Verständnis"@de ;
            rdfs:label "Interaktion/Förståelse"@sv .

        :Delegate_Explicit_Transfer a :DivisionOfLabour,
                owl:NamedIndividual ;
            rdfs:label "Handling Tasks/Delegate, Explicit Transfer"@en ;
            rdfs:label "Aufgabenübertragung/Delegieren, explizite Übergabe"@de ;
            rdfs:label "Uppgiftsfördelning/Delegera, tydlig överföring"@sv .

        :Delivering_Care a :Object,
                owl:NamedIndividual ;
            rdfs:label "Action/Delivering Care"@en ;
            rdfs:label "Handlung/Pflege leisten"@de ;
            rdfs:label "Åtgärd/Ge vård"@sv .

        :Nursing_Home a :Community,
                owl:NamedIndividual ;
            rdfs:label "Setting/Nursing Home"@en ;
            rdfs:label "Versorgungsort/Pflegeheim"@de ;
            rdfs:label "Vårdplats/Särskilt boende"@sv .
    "
`

/**
 * System prompt instructing the LLM to act as a knowledge graph generation expert.
 * It then guides the LLM to extract entities and relations according to the activate ontology
 * and generate a knowledge graph in Turtle Syntax.
 */
export const personaSystemPrompt = {
    zero: personaBasePrompt + ttlOnlyInsctruction,
    zeroPlusVocab: personaBasePrompt + vocabInstruction + ttlOnlyInsctruction,
    one: personaBasePrompt + example_small + ttlOnlyInsctruction,
    onePlusVocab: personaBasePrompt + vocabInstruction + example_small + ttlOnlyInsctruction
};

/**
 *  Raw system prompt for knowledge graph generation. Does not include any prompt engineering strategies.
 */
export const baseSystemPrompt = {
    zero: rawBasePrompt + ttlOnlyInsctruction,
    zeroPlusVocab: rawBasePrompt + vocabInstruction + ttlOnlyInsctruction,
    one: rawBasePrompt + example_small + ttlOnlyInsctruction,
    onePlusVocab: rawBasePrompt + vocabInstruction + example_small + ttlOnlyInsctruction
}

/**
 * Iterative System prompts for knowledge graph generation.
 * These prompts are designed to be used in an iterative process, where each step builds on the previous one.
 * They guide the LLM through the process of extracting entities, setting information, relations, and conflicts/feedbacks/impressions from the input text.
 * Each prompt is structured to output the results in a specific format, ensuring consistency and clarity in the generated knowledge graph.
 * The prompts are designed to be used in a sequence, with each prompt focusing on a specific aspect of the knowledge graph generation process.
 */
export const iterativeSystemPrompts = {
    zeroPlusVocab: [
        `
        Given any text, you will extract a fitting name and a description for the general present setting. 
        Output the results in Turtle Syntax, generating Labels in German, English and Swedish:
        
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        :UniqueIdentifier a owl:NamedIndividual ;
        :ActivityDescription "description"@en ;
        # Other language decriptions
        :ActivityName "name"@en .
        # Other language names
        '''

        Output only the requested Turtle Syntax, without any additional text or explanations.
        `,
        `
        Given any text, you will extract the most important entities from it and assign them one or multiple of the following classes
        according to their context in the given situation:
        ${classExplanation2}
        Output the entities in Turtle Syntax, generating Labels in German, English and Swedish for each entitiy:

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

        Output only the requested format, without any additional text or explanations.
        `,
        `
        Given any text and a list of entities, you will extract each entities properties that can be derived from the text.
        The input will be structured as follows:

        Text: "Text to extract properties f"
        Entities: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output an extended version of the entity input in the following format, generating Labels in German, English and Swedish. For this you should use the
        following vocabulary, only deriving if properties can not be respresented otherwise:

        Vocabulary:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :InstrumentDescription rdf:type owl:DatatypeProperty ;
                            rdfs:domain :Instrument ;
                            rdfs:range xsd:string .

        :InstrumentName rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Instrument ;
                        rdfs:range xsd:string .

        :InstrumentType rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Instrument ;
                        rdfs:range xsd:string .

        :RuleDescription rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Rule ;
                        rdfs:range xsd:string .

        :RuleName rdf:type owl:DatatypeProperty ;
                rdfs:domain :Rule ;
                rdfs:range xsd:string .

        :SubjectAge rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .

        :SubjectName rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .

        :SubjectSex rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .
        '''

        Output only the requested format, without any additional text or explanations.
        `,
        `
        Given any text and a list of entities, you will extract the most important relations between the entities.
        The input will be structured as follows:

        Text: "Text to extracte relations from"
        Entities: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output the relations in Turtle Syntax, generating Labels in German, English and Swedish for each relation and extending the user input with the used
        relations. You should use the following vocabulary, only deriving if relations can not be respresented otherwise.
        Used Vocabulary must not be included in the output:

        Vocabulary:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :CausedByViolationOf rdf:type owl:ObjectProperty ;
                            rdfs:domain :Conflict ;
                            rdfs:range :Rule ;
                            rdfs:label "Caused by a violation of"@en ,
                                        "Orsakas av överträdelse av"@sv ,
                                        "Verursacht durch Verletzung von"@de .

        :CreatesAndIsRegulatedBy rdf:type owl:ObjectProperty ;
                                rdfs:domain :Community ;
                                rdfs:range :Rule ;
                                rdfs:label "Creates and is regulated by"@en ,
                                            "Erstellt und wird gereglt durch"@de ,
                                            "Skapar och regleras av"@sv .

        :DefinesRoleOf rdf:type owl:ObjectProperty ;
                    rdfs:domain :DivisionOfLabour ;
                    rdfs:range :Subject ;
                    rdfs:label "Defines role of"@en ,
                                "Definierar rollen av"@sv ,
                                "Definiert die Rolle von"@de .

        :DefinesTheApproachOf rdf:type owl:ObjectProperty ;
                            rdfs:domain :Object ;
                            rdfs:range :Subject ;
                            rdfs:label "Defines the approach of"@en ,
                                        "Definierar tillvägagångssättet för"@sv ,
                                        "Definiert den Ansatz von"@de .

        :Determines rdf:type owl:ObjectProperty ;
                    rdfs:domain :Object ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Bestimmt"@de ,
                            "Bestämmer"@sv ,
                            "Determines"@en .

        :DevelopsAndUses rdf:type owl:ObjectProperty ;
                        rdfs:domain :Community ;
                        rdfs:range :Instrument ;
                        rdfs:label "Develops and uses"@en ,
                                    "Entwickelt und benutzt"@de ,
                                    "Utvecklar och använder"@sv .
                    
        :HasToFollow rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Rule ;
                    rdfs:label "Has to follow"@en ,
                                "Muss folgen"@de ,
                                "Måste följa"@sv .

        :Influences rdf:type owl:ObjectProperty ;
                    rdfs:domain :Rule ;
                    rdfs:range :Object ;
                    rdfs:label "Beeinflusst"@de ,
                            "Influences"@en ,
                            "Påverkar"@sv .

        :InfluencesTheChoiceof rdf:type owl:ObjectProperty ;
                            rdfs:domain :Object ;
                            rdfs:range :Instrument ;
                            rdfs:label "Beeinflusst die Wahl von"@de ,
                                        "Influences the choice of"@en ,
                                        "Påverkar valet av"@sv .

        :InteractsIn rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Community ;
                    rdfs:label "Interacts in"@en ,
                                "Interagerar i"@sv ,
                                "Interagiert in"@de .

        :InteractsWith rdf:type owl:ObjectProperty ;
                    rdfs:domain :Community ;
                    rdfs:range :Subject ;
                    rdfs:label "Interacts with"@en ,
                                "Interagerar med"@sv ,
                                "Interagiert mit"@de .

        :IsAppliedToAchieve rdf:type owl:ObjectProperty ;
                            rdfs:domain :DivisionOfLabour ;
                            rdfs:range :Object ;
                            rdfs:label "Används för att uppnå"@sv ,
                                    "Is applied to achieve"@en ,
                                    "Wird angewandt zum Erreichen von"@de .

        :IsDefinedBy rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Is defined by"@en ,
                                "Ist definiert durch"@de ,
                                "Är definierad av"@sv .

        :IsDevelopedAndUsedBy rdf:type owl:ObjectProperty ;
                            rdfs:domain :Instrument ;
                            rdfs:range :Community ;
                            rdfs:label "Is developed and used by"@en ,
                                        "Utvecklas och används av"@sv ,
                                        "Wird entwickelt und genutzt von"@de .

        :IsInfluencedBy rdf:type owl:ObjectProperty ;
                        rdfs:domain :Object ;
                        rdfs:range :Rule ;
                        rdfs:label "Is influenced by"@en ,
                                "Påverkas av"@sv ,
                                "Wird beeinflusst von"@de .

        :IsOrganisedBy rdf:type owl:ObjectProperty ;
                    rdfs:domain :Community ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Is organised by"@en ,
                                "Ist organisiert durch"@de ,
                                "Är organiserad av"@sv .

        :IsUsedBy rdf:type owl:ObjectProperty ;
                rdfs:domain :Instrument ;
                rdfs:range :Subject ;
                rdfs:label "Används av"@sv ,
                            "Is used by"@en ,
                            "Wird benutzt von"@de .

        :IsUsedOn rdf:type owl:ObjectProperty ;
                rdfs:domain :Instrument ;
                rdfs:range :Object ;
                rdfs:label "Används på"@sv ,
                            "Is used on"@en ,
                            "Wird angewandt auf"@de .

        :OperatesOn rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Object ;
                    rdfs:label "Fungerar på"@sv ,
                            "Operates on"@en ,
                            "Operiert auf"@de .

        :Organises rdf:type owl:ObjectProperty ;
                rdfs:domain :DivisionOfLabour ;
                rdfs:range :Community ;
                rdfs:label "Organiserar"@sv ,
                            "Organises"@en ,
                            "Organisiert"@de .

        :RegulatesActionOf rdf:type owl:ObjectProperty ;
                        rdfs:domain :Rule ;
                        rdfs:range :Subject ;
                        rdfs:label "Reglerar handlingen av"@sv ,
                                    "Regulates action of"@en ,
                                    "Reguliert die Handlung von"@de .

        :RegulatesAndIsCreatedBy rdf:type owl:ObjectProperty ;
                                rdfs:domain :Rule ;
                                rdfs:range :Community ;
                                rdfs:label "Reglerar och skapas av"@sv ,
                                            "Regulates and is created by"@en ,
                                            "Reguliert und wird erstellt von"@de .

        :ShallBeAchievedBy rdf:type owl:ObjectProperty ;
                        rdfs:domain :Object ;
                        rdfs:range :Community ;
                        rdfs:label "Shall be achieved by"@en ,
                                    "Skall uppnås genom"@sv ,
                                    "Soll erreicht werden durch"@de .

        :Shares rdf:type owl:ObjectProperty ;
                rdfs:domain :Community ;
                rdfs:range :Object ;
                rdfs:label "Delar"@sv ,
                        "Shares"@en ,
                        "Teilt"@de .

        :Uses rdf:type owl:ObjectProperty ;
            rdfs:domain :Subject ;
            rdfs:range :Instrument ;
            rdfs:label "Använder"@sv ,
                        "Benutzt"@de ,
                        "Uses"@en .
        '''

        The output must be structured as follows:

        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :RelationID rdf:type owl:ObjectProperty ;
        rdfs:domain :ClassOfSourceEntity ;
        rdfs:range :ClassOfTargetEntity ;
        rdfs:label "Relation label"@en .
        # Other language labels

        # Other relations
        
        :UniqueIdentifier a :EntityClass,
            owl:NamedIndividual ;
            rdfs:label "EntityLabel"@en ;
            # Other language labels
            :UsedRelationID :IDOfRelationTarget .
            # Other used relations        
        '''

        Output only the requested format, without any additional text or explanations.                            
        `,
        `
        Given any text, a list of entities including their relations, you will extract all important conflicts, feedbacks and impressions between/of the entities.

        The extracted conflicts, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
        a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
        given entities that initiated the conflict/feedback/impression.
        If entities are involved in a conflict/feedback/impression, they must be linked
        with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have paricipants from
        more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
        combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
        combinations of three classes are not allowed! Make sure to never break this rule. 
        If the participants belong to just one or two classes, the classes may be chosen freely.   

        If other entities respond to a conflict/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked
        to the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
        ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
        The comments may have further comments which must also be linked in the same way using "HasComment".


        The input will be structured as follows:
        Text: "Text to extract conflicts/feedbacks/impressions from"
        Data: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :RelationID rdf:type owl:ObjectProperty ;
        rdfs:domain :ClassOfSourceEntity ;
        rdfs:range :ClassOfTargetEntity ;
        rdfs:label "Relation label"@en .
        # Other language labels

        # Other relations
        
        :UniqueIdentifier a :EntityClass,
            owl:NamedIndividual ;
            rdfs:label "EntityLabel"@en ;
            # Other language labels
            :UsedRelationID :IDOfRelationTarget .
            # Other used relations        
        '''
        
        Output the conflicts/feedbacks/impressions in the following format, generating Titles and Descriptions in German, English and Swedish for each conflict/feedbacks/impressions:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :ConflictID a :Conflict ;
        :ConflictTitle "Title"@en ;
        # Other language titles
        :ConflictDescription "Description"@en ;
        # Other language decriptions  
        :ConflictState "open" ;
        :WrittenBy :EntityIDs ;
        :HasParticipant :EntityIDs ;
        :CreationDate "Timestamp (Example: 2024-06-01T12:30:00Z)" .

        :CommentID a :Comment ;
        :CommentDescription "Comment"@en ;
        # Other language comments
        :WrittenBy :EntityIDs ;
        :CreationDate "Timestamp (Example: 2024-06-01T12:35:00Z)" .

        :ConflictIDorCommentID :HasComment :CommentID .
        '''
        
        Output only the requested format, without any additional text or explanations. 
        `,
        `
        Given three Turtle Syntax inputs, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by
        combining the triples and ensuring that there are no duplicate triples in the output.

        The Input will be structured as follows:
        Setting: '''turtle ... '''
        Entities: '''turtle ... '''
        Conflicts: '''turtle ... '''
        
        ${ttlOnlyInsctruction}
        `,
    ],
    onePlusVocab: [
        `
        Given any text, you will extract a fitting name and a description for the general present setting. 
        Output the results in Turtle Syntax, generating Labels in German, English and Swedish:
        
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        :UniqueIdentifier a owl:NamedIndividual ;
        :ActivityDescription "description"@en ;
        # Other language decriptions
        :ActivityName "name"@en .
        # Other language names
        '''

        ${example_setting_extraction} 

        Output only the requested Turtle Syntax, without any additional text or explanations.
        `,
        `
        Given any text, you will extract the most important entities from it and assign them one or multiple of the following classes
        according to their context in the given situation:
        ${classExplanation2}
        Output the entities in Turtle Syntax, generating Labels in German, English and Swedish for each entitiy:

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

        ${example_entity_extraction}

        Output only the requested format, without any additional text or explanations.
        `,
        `
        Given any text and a list of entities, you will extract each entities properties that can be derived from the text.
        The input will be structured as follows:

        Text: "Text to extract properties f"
        Entities: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output an extended version of the entity input in the following format, generating Labels in German, English and Swedish. For this you should use the
        following vocabulary, only deriving if properties can not be respresented otherwise:

        Vocabulary:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :InstrumentDescription rdf:type owl:DatatypeProperty ;
                            rdfs:domain :Instrument ;
                            rdfs:range xsd:string .

        :InstrumentName rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Instrument ;
                        rdfs:range xsd:string .

        :InstrumentType rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Instrument ;
                        rdfs:range xsd:string .

        :RuleDescription rdf:type owl:DatatypeProperty ;
                        rdfs:domain :Rule ;
                        rdfs:range xsd:string .

        :RuleName rdf:type owl:DatatypeProperty ;
                rdfs:domain :Rule ;
                rdfs:range xsd:string .

        :SubjectAge rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .

        :SubjectName rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .

        :SubjectSex rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range xsd:string .
        '''

        ${example_property_extraction}

        Output only the requested format, without any additional text or explanations.
        `,
        `
        Given any text and a list of entities, you will extract the most important relations between the entities.
        The input will be structured as follows:

        Text: "Text to extracte relations from"
        Entities: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .
        
        :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .
        # Other language labels
        '''

        Output the relations in Turtle Syntax, generating Labels in German, English and Swedish for each relation and extending the user input with the used
        relations. You should use the following vocabulary, only deriving if relations can not be respresented otherwise.
        Used Vocabulary must not be included in the output:

        Vocabulary:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :CausedByViolationOf rdf:type owl:ObjectProperty ;
                            rdfs:domain :Conflict ;
                            rdfs:range :Rule ;
                            rdfs:label "Caused by a violation of"@en ,
                                        "Orsakas av överträdelse av"@sv ,
                                        "Verursacht durch Verletzung von"@de .

        :CreatesAndIsRegulatedBy rdf:type owl:ObjectProperty ;
                                rdfs:domain :Community ;
                                rdfs:range :Rule ;
                                rdfs:label "Creates and is regulated by"@en ,
                                            "Erstellt und wird gereglt durch"@de ,
                                            "Skapar och regleras av"@sv .

        :DefinesRoleOf rdf:type owl:ObjectProperty ;
                    rdfs:domain :DivisionOfLabour ;
                    rdfs:range :Subject ;
                    rdfs:label "Defines role of"@en ,
                                "Definierar rollen av"@sv ,
                                "Definiert die Rolle von"@de .

        :DefinesTheApproachOf rdf:type owl:ObjectProperty ;
                            rdfs:domain :Object ;
                            rdfs:range :Subject ;
                            rdfs:label "Defines the approach of"@en ,
                                        "Definierar tillvägagångssättet för"@sv ,
                                        "Definiert den Ansatz von"@de .

        :Determines rdf:type owl:ObjectProperty ;
                    rdfs:domain :Object ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Bestimmt"@de ,
                            "Bestämmer"@sv ,
                            "Determines"@en .

        :DevelopsAndUses rdf:type owl:ObjectProperty ;
                        rdfs:domain :Community ;
                        rdfs:range :Instrument ;
                        rdfs:label "Develops and uses"@en ,
                                    "Entwickelt und benutzt"@de ,
                                    "Utvecklar och använder"@sv .
                    
        :HasToFollow rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Rule ;
                    rdfs:label "Has to follow"@en ,
                                "Muss folgen"@de ,
                                "Måste följa"@sv .

        :Influences rdf:type owl:ObjectProperty ;
                    rdfs:domain :Rule ;
                    rdfs:range :Object ;
                    rdfs:label "Beeinflusst"@de ,
                            "Influences"@en ,
                            "Påverkar"@sv .

        :InfluencesTheChoiceof rdf:type owl:ObjectProperty ;
                            rdfs:domain :Object ;
                            rdfs:range :Instrument ;
                            rdfs:label "Beeinflusst die Wahl von"@de ,
                                        "Influences the choice of"@en ,
                                        "Påverkar valet av"@sv .

        :InteractsIn rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Community ;
                    rdfs:label "Interacts in"@en ,
                                "Interagerar i"@sv ,
                                "Interagiert in"@de .

        :InteractsWith rdf:type owl:ObjectProperty ;
                    rdfs:domain :Community ;
                    rdfs:range :Subject ;
                    rdfs:label "Interacts with"@en ,
                                "Interagerar med"@sv ,
                                "Interagiert mit"@de .

        :IsAppliedToAchieve rdf:type owl:ObjectProperty ;
                            rdfs:domain :DivisionOfLabour ;
                            rdfs:range :Object ;
                            rdfs:label "Används för att uppnå"@sv ,
                                    "Is applied to achieve"@en ,
                                    "Wird angewandt zum Erreichen von"@de .

        :IsDefinedBy rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Is defined by"@en ,
                                "Ist definiert durch"@de ,
                                "Är definierad av"@sv .

        :IsDevelopedAndUsedBy rdf:type owl:ObjectProperty ;
                            rdfs:domain :Instrument ;
                            rdfs:range :Community ;
                            rdfs:label "Is developed and used by"@en ,
                                        "Utvecklas och används av"@sv ,
                                        "Wird entwickelt und genutzt von"@de .

        :IsInfluencedBy rdf:type owl:ObjectProperty ;
                        rdfs:domain :Object ;
                        rdfs:range :Rule ;
                        rdfs:label "Is influenced by"@en ,
                                "Påverkas av"@sv ,
                                "Wird beeinflusst von"@de .

        :IsOrganisedBy rdf:type owl:ObjectProperty ;
                    rdfs:domain :Community ;
                    rdfs:range :DivisionOfLabour ;
                    rdfs:label "Is organised by"@en ,
                                "Ist organisiert durch"@de ,
                                "Är organiserad av"@sv .

        :IsUsedBy rdf:type owl:ObjectProperty ;
                rdfs:domain :Instrument ;
                rdfs:range :Subject ;
                rdfs:label "Används av"@sv ,
                            "Is used by"@en ,
                            "Wird benutzt von"@de .

        :IsUsedOn rdf:type owl:ObjectProperty ;
                rdfs:domain :Instrument ;
                rdfs:range :Object ;
                rdfs:label "Används på"@sv ,
                            "Is used on"@en ,
                            "Wird angewandt auf"@de .

        :OperatesOn rdf:type owl:ObjectProperty ;
                    rdfs:domain :Subject ;
                    rdfs:range :Object ;
                    rdfs:label "Fungerar på"@sv ,
                            "Operates on"@en ,
                            "Operiert auf"@de .

        :Organises rdf:type owl:ObjectProperty ;
                rdfs:domain :DivisionOfLabour ;
                rdfs:range :Community ;
                rdfs:label "Organiserar"@sv ,
                            "Organises"@en ,
                            "Organisiert"@de .

        :RegulatesActionOf rdf:type owl:ObjectProperty ;
                        rdfs:domain :Rule ;
                        rdfs:range :Subject ;
                        rdfs:label "Reglerar handlingen av"@sv ,
                                    "Regulates action of"@en ,
                                    "Reguliert die Handlung von"@de .

        :RegulatesAndIsCreatedBy rdf:type owl:ObjectProperty ;
                                rdfs:domain :Rule ;
                                rdfs:range :Community ;
                                rdfs:label "Reglerar och skapas av"@sv ,
                                            "Regulates and is created by"@en ,
                                            "Reguliert und wird erstellt von"@de .

        :ShallBeAchievedBy rdf:type owl:ObjectProperty ;
                        rdfs:domain :Object ;
                        rdfs:range :Community ;
                        rdfs:label "Shall be achieved by"@en ,
                                    "Skall uppnås genom"@sv ,
                                    "Soll erreicht werden durch"@de .

        :Shares rdf:type owl:ObjectProperty ;
                rdfs:domain :Community ;
                rdfs:range :Object ;
                rdfs:label "Delar"@sv ,
                        "Shares"@en ,
                        "Teilt"@de .

        :Uses rdf:type owl:ObjectProperty ;
            rdfs:domain :Subject ;
            rdfs:range :Instrument ;
            rdfs:label "Använder"@sv ,
                        "Benutzt"@de ,
                        "Uses"@en .
        '''

        The output must be structured as follows:

        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :RelationID rdf:type owl:ObjectProperty ;
        rdfs:domain :ClassOfSourceEntity ;
        rdfs:range :ClassOfTargetEntity ;
        rdfs:label "Relation label"@en .
        # Other language labels

        # Other relations
        
        :UniqueIdentifier a :EntityClass,
            owl:NamedIndividual ;
            rdfs:label "EntityLabel"@en ;
            # Other language labels
            :UsedRelationID :IDOfRelationTarget .
            # Other used relations        
        '''

        ${example_relation_extraction}

        Output only the requested format, without any additional text or explanations.                            
        `,
        `
        Given any text, a list of entities including their relations, you will extract all important conflicts, feedbacks and impressions between/of the entities.

        The extracted conflicts, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
        a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
        given entities that initiated the conflict/feedback/impression.
        If entities are involved in a conflict/feedback/impression, they must be linked
        with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have paricipants from
        more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
        combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
        combinations of three classes are not allowed! Make sure to never break this rule. 
        If the participants belong to just one or two classes, the classes may be chosen freely.   

        If other entities respond to a conflict/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked
        to the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
        ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
        The comments may have further comments which must also be linked in the same way using "HasComment".


        The input will be structured as follows:
        Text: "Text to extract conflicts/feedbacks/impressions from"
        Data: '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :RelationID rdf:type owl:ObjectProperty ;
        rdfs:domain :ClassOfSourceEntity ;
        rdfs:range :ClassOfTargetEntity ;
        rdfs:label "Relation label"@en .
        # Other language labels

        # Other relations
        
        :UniqueIdentifier a :EntityClass,
            owl:NamedIndividual ;
            rdfs:label "EntityLabel"@en ;
            # Other language labels
            :UsedRelationID :IDOfRelationTarget .
            # Other used relations        
        '''
        
        Output the conflicts/feedbacks/impressions in the following format, generating Titles and Descriptions in German, English and Swedish for each conflict/feedbacks/impressions:
        '''turtle
        @prefix : <http://activate.htwk-leipzig.de/model#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @base <http://activate.htwk-leipzig.de/model> .

        :ConflictID a :Conflict ;
        :ConflictTitle "Title"@en ;
        # Other language titles
        :ConflictDescription "Description"@en ;
        # Other language decriptions  
        :ConflictState "open" ;
        :WrittenBy :EntityIDs ;
        :HasParticipant :EntityIDs ;
        :CreationDate "Timestamp (Example: 2024-06-01T12:30:00Z)" .

        :CommentID a :Comment ;
        :CommentDescription "Comment"@en ;
        # Other language comments
        :WrittenBy :EntityIDs ;
        :CreationDate "Timestamp (Example: 2024-06-01T12:35:00Z)" .

        :ConflictIDorCommentID :HasComment :CommentID .
        '''
        
        ${example_conflict_extraction}

        Output only the requested format, without any additional text or explanations. 
        `,
        `
        Given three Turtle Syntax inputs, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by
        combining the triples and ensuring that there are no duplicate triples in the output.

        The Input will be structured as follows:
        Setting: '''turtle ... '''
        Entities: '''turtle ... '''
        Conflicts: '''turtle ... '''
        
        ${ttlOnlyInsctruction}
        `,
    ],
    zero: [
        `
    Given any text, you will extract a fitting name and a description for the general present setting. 
    Output the results in Turtle Syntax, generating Labels in German, English and Swedish:
    
    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

    :UniqueIdentifier a owl:NamedIndividual ;
    :ActivityDescription "description"@en ;
    # Other language decriptions
    :ActivityName "name"@en .
    # Other language names
    '''

    Output only the requested Turtle Syntax, without any additional text or explanations.
    `,
        `
    Given any text, you will extract the most important entities from it and assign them one or multiple of the following classes
    according to their context in the given situation: 
    ${classExplanation2}

    Output the entities in Turtle Syntax, generating Labels in German, English and Swedish for each entitiy:

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

    Output only the requested format, without any additional text or explanations.
    `,
        `
    Given any text and a list of entities, you will extract each entities properties that can be derived from the text.
    The input will be structured as follows:

    Text: "Text to extract properties f"
    Entities: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .
    
    :UniqueIdentifier a :EntityClass,
    owl:NamedIndividual ;
    rdfs:label "Other Healthcare Professionals/Care Staff"@en .
    # Other language labels
    '''

    Output an extended version of the entity input in the following format, generating Labels in German, English and Swedish.

    Output only the requested format, without any additional text or explanations.
    `,
        `
    Given any text and a list of entities, you will extract the most important relations between the entities.
    The input will be structured as follows:

    Text: "Text to extracte relations from"
    Entities: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .
    
    :UniqueIdentifier a :EntityClass,
    owl:NamedIndividual ;
    rdfs:label "Other Healthcare Professionals/Care Staff"@en .
    # Other language labels
    '''

    Output the relations in Turtle Syntax, generating Labels in German, English and Swedish for each relation and extending the user input with the used
    relations. 

    The output must be structured as follows:

    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :RelationID rdf:type owl:ObjectProperty ;
    rdfs:domain :ClassOfSourceEntity ;
    rdfs:range :ClassOfTargetEntity ;
    rdfs:label "Relation label"@en .
    # Other language labels

    # Other relations
    
    :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en ;
        # Other language labels
        :UsedRelationID :IDOfRelationTarget .
        # Other used relations        
    '''

    Output only the requested format, without any additional text or explanations.                            
    `,
        `
    Given any text, a list of entities including their relations, you will extract all important conflicts, feedbacks and impressions between/of the entities.

    The extracted conflicts, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
    a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
    given entities that initiated the conflict/feedback/impression.
    If entities are involved in a conflict/feedback/impression, they must be linked
    with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have paricipants from
    more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
    combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
    combinations of three classes are not allowed!
    If the participants belong to just one or two classes, the classes may be chosen freely.   

    If other entities respond to a conflict/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked
    to the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
    ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
    The comments may have further comments which must also be linked in the same way using "HasComment".


    The input will be structured as follows:
    Text: "Text to extract conflicts/feedbacks/impressions from"
    Data: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :RelationID rdf:type owl:ObjectProperty ;
    rdfs:domain :ClassOfSourceEntity ;
    rdfs:range :ClassOfTargetEntity ;
    rdfs:label "Relation label"@en .
    # Other language labels

    # Other relations
    
    :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en ;
        # Other language labels
        :UsedRelationID :IDOfRelationTarget .
        # Other used relations        
    '''
    
    Output the conflicts/feedbacks/impressions in the following format, generating Titles and Descriptions in German, English and Swedish for each conflict/feedbacks/impressions:
    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :ConflictID a :Conflict ;
    :ConflictTitle "Title"@en ;
    # Other language titles
    :ConflictDescription "Description"@en ;
    # Other language decriptions  
    :ConflictState "open" ;
    :WrittenBy :EntityIDs ;
    :HasParticipant :EntityIDs ;
    :CreationDate "Timestamp (Example: 2024-06-01T12:30:00Z)" .

    :CommentID a :Comment ;
    :CommentDescription "Comment"@en ;
    # Other language comments
    :WrittenBy :EntityIDs ;
    :CreationDate "Timestamp (Example: 2024-06-01T12:35:00Z)" .

    :ConflictIDorCommentID :HasComment :CommentID .
    '''
    
    Output only the requested format, without any additional text or explanations. 
    `,
        `
    Given three Turtle Syntax inputs, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by
    combining the triples and ensuring that there are no duplicate triples in the output.

    The Input will be structured as follows:
    Setting: '''turtle ... '''
    Entities: '''turtle ... '''
    Conflicts: '''turtle ... '''
    
    ${ttlOnlyInsctruction}
    `,
    ],
    one: [
        `
    Given any text, you will extract a fitting name and a description for the general present setting. 
    Output the results in Turtle Syntax, generating Labels in German, English and Swedish:
    
    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

    :UniqueIdentifier a owl:NamedIndividual ;
    :ActivityDescription "description"@en ;
    # Other language decriptions
    :ActivityName "name"@en .
    # Other language names
    '''

    ${example_setting_extraction} 

    Output only the requested Turtle Syntax, without any additional text or explanations.
    `,
        `
    Given any text, you will extract the most important entities from it and assign them one or multiple of the following classes
    according to their context in the given situation: 
    ${classExplanation2}

    Output the entities in Turtle Syntax, generating Labels in German, English and Swedish for each entitiy:

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

    ${example_entity_extraction}

    Output only the requested format, without any additional text or explanations.
    `,
        `
    Given any text and a list of entities, you will extract each entities properties that can be derived from the text.
    The input will be structured as follows:

    Text: "Text to extract properties f"
    Entities: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .
    
    :UniqueIdentifier a :EntityClass,
    owl:NamedIndividual ;
    rdfs:label "Other Healthcare Professionals/Care Staff"@en .
    # Other language labels
    '''

    Output an extended version of the entity input in the following format, generating Labels in German, English and Swedish. 

    ${example_property_extraction}

    Output only the requested format, without any additional text or explanations.
    `,
        `
    Given any text and a list of entities, you will extract the most important relations between the entities.
    The input will be structured as follows:

    Text: "Text to extracte relations from"
    Entities: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .
    
    :UniqueIdentifier a :EntityClass,
    owl:NamedIndividual ;
    rdfs:label "Other Healthcare Professionals/Care Staff"@en .
    # Other language labels
    '''

    Output the relations in Turtle Syntax, generating Labels in German, English and Swedish for each relation and extending the user input with the used
    relations. 

    The output must be structured as follows:

    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :RelationID rdf:type owl:ObjectProperty ;
    rdfs:domain :ClassOfSourceEntity ;
    rdfs:range :ClassOfTargetEntity ;
    rdfs:label "Relation label"@en .
    # Other language labels

    # Other relations
    
    :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en ;
        # Other language labels
        :UsedRelationID :IDOfRelationTarget .
        # Other used relations        
    '''

    ${example_relation_extraction}

    Output only the requested format, without any additional text or explanations.                            
    `,
        `
    Given any text, a list of entities including their relations, you will extract all important conflicts, feedbacks and impressions between/of the entities.

    The extracted conflicts, feedbacks and impressions must be assigned a unique identifier, the class "Conflict", a title ("ConflictTitle"),
    a description ("ConflictDescription"), the state ("ConflictState") "open" and an author ("WrittenBy") who must be one of the
    given entities that initiated the conflict/feedback/impression.
    If entities are involved in a conflict/feedback/impression, they must be linked
    with the relation "HasParticipant" with the conflict/feedback/impression as the source entity. A conflict/feedback/impression must not have paricipants from
    more than three classes. If the participants belong to exactly three classes, the classes may only be from one of the following 
    combinations: (Subject,Instrument, Object), (Subject, Rule, Community), (Object, Community, DivisionOfLabour) or (Subject, Object, Community). Other
    combinations of three classes are not allowed!
    If the participants belong to just one or two classes, the classes may be chosen freely.   

    If other entities respond to a conflict/feedback/impression, they must be linked by creating a new entity of the "Comment" class and linked
    to the conflict/feedback/impression with the relation "HasComment". The comment must have a unique identifier a description which must not be a direct quote
    ("CommentDescription") and an author ("WrittenBy") who must be one of the entities that responded to the conflict/feedback/impression.
    The comments may have further comments which must also be linked in the same way using "HasComment".


    The input will be structured as follows:
    Text: "Text to extract conflicts/feedbacks/impressions from"
    Data: '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :RelationID rdf:type owl:ObjectProperty ;
    rdfs:domain :ClassOfSourceEntity ;
    rdfs:range :ClassOfTargetEntity ;
    rdfs:label "Relation label"@en .
    # Other language labels

    # Other relations
    
    :UniqueIdentifier a :EntityClass,
        owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en ;
        # Other language labels
        :UsedRelationID :IDOfRelationTarget .
        # Other used relations        
    '''
    
    Output the conflicts/feedbacks/impressions in the following format, generating Titles and Descriptions in German, English and Swedish for each conflict/feedbacks/impressions:
    '''turtle
    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @base <http://activate.htwk-leipzig.de/model> .

    :ConflictID a :Conflict ;
    :ConflictTitle "Title"@en ;
    # Other language titles
    :ConflictDescription "Description"@en ;
    # Other language decriptions  
    :ConflictState "open" ;
    :WrittenBy :EntityIDs ;
    :HasParticipant :EntityIDs ;
    :CreationDate "Timestamp (Example: 2024-06-01T12:30:00Z)" .

    :CommentID a :Comment ;
    :CommentDescription "Comment"@en ;
    # Other language comments
    :WrittenBy :EntityIDs ;
    :CreationDate "Timestamp (Example: 2024-06-01T12:35:00Z)" .

    :ConflictIDorCommentID :HasComment :CommentID .
    '''
    
    ${example_conflict_extraction}

    Output only the requested format, without any additional text or explanations. 
    `,
        `
    Given three Turtle Syntax inputs, you will merge them into one Turtle Syntax output. Do not concatenate the inputs, but merge them by
    combining the triples and ensuring that there are no duplicate triples in the output.

    The Input will be structured as follows:
    Setting: '''turtle ... '''
    Entities: '''turtle ... '''
    Conflicts: '''turtle ... '''
    
    ${ttlOnlyInsctruction}
    `,
    ],
}

/**
 * System prompt instructing the LLM to fix Turtle Syntax errors.
 */
export const ttlSyntaxFixPrompt = `
Given an input in Turtle Syntax with an array of error message, you will fix alle of the errors. If they were to result in further errors, 
you will fix those as well. You will not modify any of the given triples, but only fix the syntax errors.
Output only the fixed Turtle Syntax, without any additional text or explanations. 
`

/**
 * System prompt instructing the LLM to edit Turtle Syntax according to user instructions.
 */
export const ttlEditPrompt = `
Given an input in Turtle Syntax with an instruction containing a change request, you will edit the Turtle Syntax accordingly.
Do not do any changes other than those requested by the user. 
The input will be structured as follows:

TTL: '''turtle content to be edited'''
Insctuctions: "User instructions for editing the Turtle Syntax"

Output only the edited Turtle Syntax, without any additional text or explanations.
`

const example_template_included = `
    Here's an example:

    User Input:
    "
    Hospital nurse:
    Two weeks ago, we had a (…) seriously ill COPD patient admitted to the hospital (…), and then I
    wasn’t told until the handover that the patient was going home today. (…) it was in a letter from the
    doctor at the hospital saying that he had no more treatment to offer (…). And then I really expected
    them to maybe have prescribed some painkillers … But there was nothing about that in the papers.
    And the patient got so bad during the afternoon and evening that I had to call the emergency GP
    here, who fortunately came to monitor the patient. And the patient died the next morning … Well,
    then you’d like to have had a bit more clarification from the specialist health services.
    Consultation between in- and out-of-hospital healthcare providers before transfer

    Family physician:
    Receiving timely and adequate information and talking together about a care plan for patients with
    complex palliative needs before discharge, is very important. Mostly, I find that when I call the
    hospital (…), we can have a dialogue around the patient and a discussion, so we reach a common
    solution (…). We have different expertise. I’m a specialist in general practice, I might be talking to a
    cancer specialist. (…) And then I’m the one who knows the patient best. And then the oncologist
    knows his subject best, you see. So, then we can meet halfway and say, hey, this works, or this
    doesn’t work. (…) To supplement a referral (…) you should maybe often have a telephone call.
    Answer to the preceding note: Family physician:
    I sometimes call the hospital for advice during a consultation and turn up the volume of the palliative
    care specialist to enable the patient to take part in the discussion.
    Contextual patient information for transfer

    Hospital nurse:
    ‘. . . a referral letter mentioning besides diarrhea: that’s how it goes at home, for instance there’s one
    daughter, ehm who is having a cancer problem herself and she can’t guarantee the caregiving any
    longer. You won’t learn this through the referral letter easily. That’s something I personally regret
    very much.
    Answer to the preceding note Family physician:
    Conversely, sometimes the discharge report is too concise and too medical and there often is a lack
    of information passing through to the GP.’
    Shared care of palliative care teams and primary health care providers

    Palliative physician:
    We have to build working relationships where we assist in patient and family care and we’re seen as
    reducing the workload and actually aiding the family doctor and the other people involved in care by
    bringing...different skill sets that will make their life easier, and patient care better, and release some
    of the burden of the increased demands these kinds of patients and families have as they become
    more disabled...with their disease.

    Family physician:
    Family medicine has actually always been palliative medicine. We just haven't defined it as this (...)
    For our older colleagues the term palliative medicine just doesn't do anything for them. (...) They say
    that we have always done this. What do you need with this new-fangled stuff?
    Shared care during out-of-hours home care crises

    Family physician:
    Maybe a patient has had plenty of contact with the specialist health services, and then it kind of
    breaks down, and when it breaks down, well, that’s it, so then we just say, what do we do now? And
    there will probably be some unnecessary hospital admissions, because then they end up in the
    emergency clinic and then you don’t know … but is this really a terminal process, should the patient
    go to the rural medical centre instead or what, and then that doctor doesn’t know about that, it can
    be difficult to have the necessary discussion about this out-of-hours, and then perhaps instead the
    patient will be sent to the main hospital."

    Output:
    "@prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

    :0e0f54f8ed0c9e266cf52f0ad7c91e8f70c9af1a a :Conflict ;
        :ConflictDescription "<p>We have to build working relationships where we assist in patient and family care and we’re seen as reducing the workload and actually aiding the family doctor and the other people involved in care by bringing...different skill sets that will make their life easier, and patient care better, and release some of the burden of the increased demands these kinds of patients and families have as they become more disabled...with their disease.</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Shared care of palliative care teams and primary health care providers" ;
        :CreationDate "2025-05-21T14:57:30.011Z" ;
        :HasParticipant :Delivering_Care,
            :Home,
            :Shared_Care ;
        :WrittenBy "Palliativ Physician" .

    :7a1cda344c53a1cca3a499faf7b336af23c55c8f a :Conflict ;
        :ConflictDescription "<p>Maybe a patient has had plenty of contact with the specialist health services, and then it kind of breaks down, and when it breaks down, well, that’s it, so then we just say, what do we do now? And there will probably be some unnecessary hospital admissions, because then they end up in the emergency clinic and then you don’t know … but is this really a terminal process, should the patient go to the rural medical centre instead or what, and then that doctor doesn’t know about that, it can be difficult to have the necessary discussion about this out-of-hours, and then perhaps instead the patient will be sent to the main hospital.</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Shared care during out-of-hours home care crises" ;
        :CreationDate "2025-05-21T15:12:04.367Z" ;
        :HasParticipant :Context_Information,
            :Coordination,
            :Emergency_Physician,
            :Generalist,
            :Home,
            :Single_carer ;
        :WrittenBy "Generalist" .

    :8a8b77465ce9fba216b77bdcd2b526d409ab1519 a :Conflict ;
        :ConflictDescription "<p>Receiving timely and adequate information and talking together about a care plan for patients with complex palliative needs before discharge, is very important. Mostly, I find that when I call the hospital (…), we can have a dialogue around the patient and a discussion, so we reach a common solution (…). We have different expertise. I’m a specialist in general practice, I might be talking to a cancer specialist. (…) And then I’m the one who knows the patient best. And then the oncologist knows his subject best, you see. So, then we can meet halfway and say, hey, this works, or this doesn’t work. (…) To supplement a referral (…) you should maybe often have a telephone call.</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Consultation between in- and out-of-hospital healthcare providers before transfer" ;
        :CreationDate "2025-05-21T14:41:58.666Z" ;
        :HasParticipant :Consultation,
            :Generalist,
            :Home,
            :Negotiate,
            :Oncologist ;
        :WrittenBy "Generalist" .

    :90afb5e8d94553746e90fdb21b882337f68c9d31 a :Conflict ;
        :ConflictDescription "<p>Family medicine has actually always been palliative medicine. We just haven't defined it as this (...) For our older colleagues the term palliative medicine just doesn't do anything for them. (...) They say that we have always done this. What do you need with this new-fangled stuff?</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Shared care of palliative care teams and primary health care providers" ;
        :CreationDate "2025-05-21T15:08:09.924Z" ;
        :HasParticipant :Arrogance,
            :Delivering_Care,
            :Generalist,
            :Palliative_physician ;
        :WrittenBy "Generalist" .

    :Age a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Age"@en .

    :Ampul a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Medication/Ampul"@en .

    :Appraisal a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Appraisal"@en .

    :Bell_mat a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Monitoring/Bell mat"@en .

    :COPD a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/COPD"@en .

    :Care_Staff a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .

    :Career_Choice a :Community,
            owl:NamedIndividual ;
        rdfs:label "Personal Choices/Career Choice"@en .

    :Checking a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Checking"@en .

    :Co-Location a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Orfanisation/Co-Location"@en .

    :Coaching a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Competence/Coaching"@en .

    :Communication a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Communication"@en .

    :Community_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Community Nurse"@en .

    :Complexity a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Complexity"@en .

    :Connectedness a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Connectedness"@en .

    :Construction a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Construction"@en .

    :Conversation_With_Patient a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Conversation With Patient"@en .

    :Conviction a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Conviction"@en .

    :Cultural_Background a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Cultural Background"@en .

    :Culture a :Community,
            owl:NamedIndividual ;
        rdfs:label "Kultur"@de,
            "Culture"@en,
            "Kultur"@sv .

    :Cure a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Cure"@en .

    :Death a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Death"@en .

    :Decision_Making a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Decision Making"@en .

    :Decisionmaking a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Decisionmaking"@en .

    :Delegate_Explicit_Transfer a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Delegate, Explicit Transfer"@en .

    :Delirium a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Dilirium"@en .

    :Delivering_Prognoses a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Delivering Prognoses"@en .

    :Delivery a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Delivery"@en .

    :Dementia a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Dementia"@en .

    :Dietrician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Dietrician"@en .

    :Digital_Record a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Digital Record"@en .

    :Discussion_Of_Own_Views a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Discussion Of Own Views"@en .

    :Dissonance a :Object,
            owl:NamedIndividual ;
        rdfs:label "Relatives/Dissonance"@en .

    :Distance a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Distance"@en .

    :Education_And_Preparation a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Education And Preparation"@en .

    :Email a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Email"@en .

    :Emotions a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Emotions"@en .

    :End_Of_Life_Conversation a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/End Of Life Conversation"@en .

    :Flow_Chart a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Flow Chart"@en .

    :ForeignLanguage a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Foreign Language"@en .

    :Geriatrician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Geriatrician"@en .

    :Hallway_Meeting a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Informal/Hallway Meeting"@en .

    :Hierarchy a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Hierarchy"@en .

    :Homecare_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Homecare Nurse"@en .

    :Hospice a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Hospice"@en .

    :IP_Team a :Subject,
            owl:NamedIndividual ;
        rdfs:label "IP Team"@en .

    :Immediate_Needs a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Immediate Needs"@en .

    :Incompetence a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Incompetence"@en .

    :Informedness a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Informedness"@en .

    :Known_or_Unknown a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Known or Unknown"@en .

    :Labelling_Artifacts a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Labelling Artifacts"@en .

    :Leaving_Implicit_Defer a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Leaving, Implicit Defer"@en .

    :Liquid a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Medication/Liquid"@en .

    :Medication a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Deliver/Therapeutic Intervention/Medication"@en .

    :Needs_assessment a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Needs Assessment"@en .

    :Nursing_Home a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Nursing Home"@en .

    :Nursinghome_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Nursinghome Nurse"@en .

    :Orthopaedic a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Orthopaedic"@en .

    :Pain a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Pain"@en .

    :Palliative_Care_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Palliative Care Nurse"@en .

    :Perception_Of_Importance a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Perception Of Importance"@en .

    :Perfusor a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Perfusor"@en .

    :Personal_Priority a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Personal Priority"@en .

    :Physiotherapist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Physiotherapist"@en .

    :Pre-Existing_Complexity a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Pre-Existing Complexity"@en .

    :Proactive a :Instrument,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Proactive"@en,
            "Interaction/Proactive"@en .

    :Psychosocial-Spiritual_Issues a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Psychosocial–Spiritual Issues"@en .

    :Pump a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Pump"@en .

    :Rejecting a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Rejecting"@en .

    :Relatives a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Relatives"@en .

    :Role a :Instrument,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Role"@en,
            "Interaction/Role"@en .

    :Rounds a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Formal/Rounds"@en .

    :Scheduling a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Scheduling"@en .

    :Sharing a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Sharing"@en .

    :Social_Worker a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Social Worker"@en .

    :Stigmatised a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Stigmatised"@en .

    :Stock a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Stock"@en .

    :Substance a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Deliver/Substance"@en .

    :Substitution a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Responsibility/Substitution"@en .

    :Surgeon a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Surgeon"@en .

    :Team a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Team"@en .

    :Team_Meeting a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Formal/Team Meeting"@en .

    :Telephone a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Telephone"@en .

    :Telephone_Call a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Informal/Telephone Call"@en .

    :Template a owl:NamedIndividual ;
        :ActivityDescription "Transfers and shared care of hospital and primary healthcare providers" ;
        :ActivityName "Transmural healthcare" .

    :Time_allocation a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Time Allocation"@en .

    :Timing_And_Timeliness a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Timing And Timeliness"@en .

    :Training a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Competence/Training"@en .

    :Uncomfortable a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Uncomfortable"@en .

    :Understanding a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Understanding"@en .

    :Unsuccessful a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Unsuccessful"@en .

    :Unsure a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Unsure"@en .

    :Venous_Port a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Venous Port"@en .

    :Video_Conference a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Video Conference"@en .

    :c7359f7add8c505e5eec16615924db6de1d6124c a :Conflict ;
        :ConflictDescription "<p>Two weeks ago, we had a (…) seriously ill COPD patient admitted to the hospital (…), and then I wasn’t told until the handover that the patient was going home today. (…) it was in a letter from the doctor at the hospital saying that he had no more treatment to offer (…). And then I really expected them to maybe have prescribed some painkillers … But there was nothing about that in the papers. And the patient got so bad during the afternoon and evening that I had to call the emergency GP here, who fortunately came to monitor the patient. And the patient died the next morning … Well, then you’d like to have had a bit more clarification from the specialist health services.</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Consultation between in-hospital healthcare providers before transfer" ;
        :CreationDate "2025-05-21T14:35:10.778Z" ;
        :HasParticipant :Hospital_Nurse,
            :Shared_Information,
            :Transfer,
            :Transfer_Letter,
            :Unspecified ;
        :WrittenBy "Hospital Nurse" .

    :caf78d7133a1673422a94675b0926c791f49e955 a :Conflict ;
        :ConflictDescription "<p>A referral letter mentioning besides diarrhea: that’s how it goes at home, for instance there’s one daughter, ehm who is having a cancer problem herself and she can’t guarantee the caregiving any longer. You won’t learn this through the referral letter easily. That’s something I personally regret very much.</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Contextual patient information for transfer" ;
        :CreationDate "2025-05-21T14:52:10.559Z" ;
        :HasComment :419b4e18e6b8930c56866e2dd9d7b9fed70f3195 ;
        :HasParticipant :Context_Information,
            :Generalist,
            :Hospital,
            :Hospital_Nurse ;
        :WrittenBy "Hospital Nurse" .

    :root :HasComment :9cb59872faac265e0237254d1074f9a2a7f5f295 .

    :419b4e18e6b8930c56866e2dd9d7b9fed70f3195 a :Comment ;
        :CommentDescription "Conversely, sometimes the discharge report is too concise and too medical and there often is a lack of information passing through to the GP." ;
        :CreationDate "2025-05-21T14:53:38.486Z" ;
        :WrittenBy "Generalist" .

    :9cb59872faac265e0237254d1074f9a2a7f5f295 a :Comment ;
        :CommentDescription "New Note|<p><br></p>" ;
        :CreationDate "2025-05-20T14:49:04.450Z" ;
        :WrittenBy "IP Team" .

    :Arrogance a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Arrogance"@en .

    :Consultation a :DivisionOfLabour,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Consultation"@en,
            "Responsibility/Consultation"@en .

    :Coordination a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Coordination"@en .

    :Emergency_Physician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Emergency Physician"@en .

    :Hospital a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Hospital"@en .

    :Negotiate a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Negotiate"@en .

    :Oncologist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Oncologist"@en .

    :Palliative_physician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Palliativ Physician"@en .

    :Shared_Care a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Responsibility/Shared Care"@en .

    :Shared_Information a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Shared Information"@en .

    :Single_carer a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Shortage/Single Carer"@en .

    :Transfer a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Transfer"@en .

    :Transfer_Letter a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Trannsfer Letter"@en .

    :Unspecified a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Unspecified"@en .

    :Context_Information a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Context Information"@en .

    :Delivering_Care a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Delivering Care"@en .

    :Hospital_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Hospital Nurse"@en .

    :Home a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Home"@en .

    :Generalist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Generalist"@en .
    "
`

const template = `
    Here's a template for the output that you can expand upon::

    @prefix : <http://activate.htwk-leipzig.de/model#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

    :88063a5be9c10efd0beb4645fa76711613ea01ad a :Conflict ;
        :ConflictDescription "<p>Beschreibung hier</p>" ;
        :ConflictState "open" ;
        :ConflictTitle "Test-Konflikt" ;
        :CreationDate "2025-04-14T07:50:02.369Z" ;
        :HasParticipant :Conviction,
            :Death,
            :Generalist ;
        :WrittenBy "Palliative_physician" .

    :Age a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Age"@en .

    :Ampul a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Medication/Ampul"@en .

    :Appraisal a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Appraisal"@en .

    :Arrogance a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Arrogance"@en .

    :Bell_mat a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Monitoring/Bell mat"@en .

    :COPD a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/COPD"@en .

    :Care_Staff a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Care Staff"@en .

    :Career_Choice a :Community,
            owl:NamedIndividual ;
        rdfs:label "Personal Choices/Career Choice"@en .

    :Checking a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Checking"@en .

    :Co-Location a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Orfanisation/Co-Location"@en .

    :Coaching a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Competence/Coaching"@en .

    :Communication a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Communication"@en .

    :Community_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Community Nurse"@en .

    :Complexity a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Complexity"@en .

    :Connectedness a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Connectedness"@en .

    :Construction a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Construction"@en .

    :Consultation a :DivisionOfLabour,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Consultation"@en,
            "Responsibility/Consultation"@en .

    :Context_Information a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Context Information"@en .

    :Conversation_With_Patient a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Conversation With Patient"@en .

    :Coordination a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Coordination"@en .

    :Cultural_Background a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Cultural Background"@en .

    :Culture a :Community,
            owl:NamedIndividual ;
        rdfs:label "Kultur"@de,
            "Culture"@en,
            "Kultur"@sv .

    :Cure a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Cure"@en .

    :Decision_Making a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Decision Making"@en .

    :Decisionmaking a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Decisionmaking"@en .

    :Delegate_Explicit_Transfer a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Delegate, Explicit Transfer"@en .

    :Delirium a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Dilirium"@en .

    :Delivering_Care a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Delivering Care"@en .

    :Delivering_Prognoses a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Delivering Prognoses"@en .

    :Delivery a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Delivery"@en .

    :Dementia a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Dementia"@en .

    :Dietrician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Dietrician"@en .

    :Digital_Record a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Digital Record"@en .

    :Discussion_Of_Own_Views a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Discussion Of Own Views"@en .

    :Dissonance a :Object,
            owl:NamedIndividual ;
        rdfs:label "Relatives/Dissonance"@en .

    :Distance a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Distance"@en .

    :Education_And_Preparation a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Education And Preparation"@en .

    :Email a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Email"@en .

    :Emergency_Physician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Emergency Physician"@en .

    :Emotions a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Emotions"@en .

    :End_Of_Life_Conversation a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/End Of Life Conversation"@en .

    :Flow_Chart a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Flow Chart"@en .

    :ForeignLanguage a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Foreign Language"@en .

    :Geriatrician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Geriatrician"@en .

    :Hallway_Meeting a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Informal/Hallway Meeting"@en .

    :Hierarchy a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Hierarchy"@en .

    :Home a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Home"@en .

    :Homecare_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Homecare Nurse"@en .

    :Hospice a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Hospice"@en .

    :Hospital a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Hospital"@en .

    :Hospital_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Hospital Nurse"@en .

    :IP_Team a :Subject,
            owl:NamedIndividual ;
        rdfs:label "IP Team"@en .

    :Immediate_Needs a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Immediate Needs"@en .

    :Incompetence a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Incompetence"@en .

    :Informedness a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Informedness"@en .

    :Known_or_Unknown a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Known or Unknown"@en .

    :Labelling_Artifacts a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Labelling Artifacts"@en .

    :Leaving_Implicit_Defer a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Leaving, Implicit Defer"@en .

    :Liquid a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Medication/Liquid"@en .

    :Medication a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Deliver/Therapeutic Intervention/Medication"@en .

    :Needs_assessment a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Needs Assessment"@en .

    :Negotiate a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Negotiate"@en .

    :Nursing_Home a :Community,
            owl:NamedIndividual ;
        rdfs:label "Setting/Nursing Home"@en .

    :Nursinghome_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Nursinghome Nurse"@en .

    :Oncologist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Oncologist"@en .

    :Orthopaedic a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Orthopaedic"@en .

    :Pain a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Pain"@en .

    :Palliative_Care_Nurse a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Nurse/Palliative Care Nurse"@en .

    :Palliative_physician a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Palliativ Physician"@en .

    :Perception_Of_Importance a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Handling Tasks/Perception Of Importance"@en .

    :Perfusor a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Perfusor"@en .

    :Personal_Priority a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Personal Priority"@en .

    :Physiotherapist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Physiotherapist"@en .

    :Pre-Existing_Complexity a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Pre-Existing Complexity"@en .

    :Proactive a :Instrument,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Proactive"@en,
            "Interaction/Proactive"@en .

    :Psychosocial-Spiritual_Issues a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Psychosocial–Spiritual Issues"@en .

    :Pump a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Pump"@en .

    :Rejecting a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Rejecting"@en .

    :Relatives a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Relatives"@en .

    :Role a :Instrument,
            :Rule,
            owl:NamedIndividual ;
        rdfs:label "Communication/Implementation/Role"@en,
            "Interaction/Role"@en .

    :Rounds a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Formal/Rounds"@en .

    :Scheduling a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Scheduling"@en .

    :Shared_Care a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Responsibility/Shared Care"@en .

    :Shared_Information a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Shared Information"@en .

    :Sharing a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Methods To Act/Sharing"@en .

    :Single_carer a :Community,
            owl:NamedIndividual ;
        rdfs:label "Circumstances/Shortage/Single Carer"@en .

    :Social_Worker a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Other Healthcare Professionals/Social Worker"@en .

    :Stigmatised a :Object,
            owl:NamedIndividual ;
        rdfs:label "Patient Profile/Stigmatised"@en .

    :Stock a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Organisation/Stock"@en .

    :Substance a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Deliver/Substance"@en .

    :Substitution a :DivisionOfLabour,
            owl:NamedIndividual ;
        rdfs:label "Responsibility/Substitution"@en .

    :Surgeon a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Surgeon"@en .

    :Team a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Team"@en .

    :Team_Meeting a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Formal/Team Meeting"@en .

    :Telephone a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Telephone"@en .

    :Telephone_Call a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Work Format/Informal/Telephone Call"@en .

    :Template a owl:NamedIndividual ;
        :ActivityDescription "Activity Template" ;
        :ActivityName "Template Version 1.2" .

    :Time_allocation a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Time Allocation"@en .

    :Timing_And_Timeliness a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Action/Timing And Timeliness"@en .

    :Training a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Competence/Training"@en .

    :Transfer a :Object,
            owl:NamedIndividual ;
        rdfs:label "Action/Transfer"@en .

    :Transfer_Letter a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Documentation/Trannsfer Letter"@en .

    :Uncomfortable a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Uncomfortable"@en .

    :Understanding a :Rule,
            owl:NamedIndividual ;
        rdfs:label "Interaction/Understanding"@en .

    :Unspecified a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Specialist/Unspecified"@en .

    :Unsuccessful a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Unsuccessful"@en .

    :Unsure a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Perceptions/Unsure"@en .

    :Venous_Port a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Devices/Delivery/Venous Port"@en .

    :Video_Conference a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Communication/Means/Video Conference"@en .

    :Conviction a :Instrument,
            owl:NamedIndividual ;
        rdfs:label "Attitude/Conviction"@en .

    :Death a :Object,
            owl:NamedIndividual ;
        rdfs:label "Goal/Sign And Symptoms/Death"@en .

    :Generalist a :Subject,
            owl:NamedIndividual ;
        rdfs:label "Medical Practitioners/Generalist"@en .
`