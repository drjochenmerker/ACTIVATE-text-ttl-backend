export const vocab = `
@prefix : <http://activate.htwk-leipzig.de/model#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xml: <http://www.w3.org/XML/1998/namespace> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <http://activate.htwk-leipzig.de/model> .

<http://www.semanticweb.org/tobia/ontologies/2025/1/Vocabulary_2025_03_13> rdf:type owl:Ontology .

#################################################################
#    Classes
#################################################################

###  http://activate.htwk-leipzig.de/model#Comment
:Comment rdf:type owl:Class ;
         rdfs:comment "A comment related to a conflict."@en ,
                      "Ein Kommentar zu einem Konflikt."@de ,
                      "En kommentar relaterad till en konflikt."@sv ;
         rdfs:label "Comment"@en ,
                    "Kommentar"@de ,
                    "Kommentar"@sv .


###  http://activate.htwk-leipzig.de/model#Community
:Community rdf:type owl:Class ;
           rdfs:comment "Die Umgebung, in der die Aktivität stattfindet."@de ,
                        "Miljön där aktivitet sker."@sv ,
                        "The environment in which the activity is carried out."@en ;
           rdfs:label "Community"@en ,
                      "Gemeinschaft"@de ,
                      "Samhälle"@sv .


###  http://activate.htwk-leipzig.de/model#Conflict
:Conflict rdf:type owl:Class ;
          rdfs:comment "A conflict between up to three elements of the activity theory model."@en ,
                       "Ein Konflikt zwischen bis zu drei Elementen des Aktivitätstheorie-Modells."@de ,
                       "En konflikt mellan upp till tre element från aktivitets teori modellen."@sv ;
          rdfs:label "Conflict"@en ,
                     "Konflikt"@de ,
                     "Konflikt"@sv .


###  http://activate.htwk-leipzig.de/model#DivisionOfLabour
:DivisionOfLabour rdf:type owl:Class ;
                  rdfs:comment "Vem är ansvarig för vad, när man utför denna aktivitet och hur är roller organiserade."@sv ,
                               "Wer ist für was verantwortlich, wenn man diese Aktivität durchführt und wie sind die Rollen organisiert."@de ,
                               "Who is responsible for what, when carrying out this activity and how the roles are organised."@en ;
                  rdfs:label "Arbeitsteilung"@de ,
                             "Arbetsfördelning"@sv ,
                             "Division of Labour"@en .


###  http://activate.htwk-leipzig.de/model#Instrument
:Instrument rdf:type owl:Class ;
            rdfs:comment "De medel som används av försökspersonen för att utföra aktiviteten."@sv ,
                         "Die Mittel, mit denen das Subjekt die Aktivität durchführt."@de ,
                         "The means by which the subject carries out the activity."@en ;
            rdfs:label "Instrument"@de ,
                       "Instrument"@en ,
                       "Instrument"@sv .


###  http://activate.htwk-leipzig.de/model#Object
:Object rdf:type owl:Class ;
        rdfs:comment "Der Grund, warum diese Aktivität stattfindet."@de ,
                     "Orsaken till att denna aktivitet sker."@sv ,
                     "The reason why thsi activity takes place."@en ;
        rdfs:label "Object"@en ,
                   "Objekt"@de ,
                   "Objekt"@sv .


###  http://activate.htwk-leipzig.de/model#Rule
:Rule rdf:type owl:Class ;
      rdfs:comment "Cultural norms, rules and regulations governing the performance of this activity."@en ,
                   "Kulturella normer, regler och bestämmelser som reglerar utförandet av denna aktivitet."@sv ,
                   "Kulturelle Normen, Regeln und Vorschriften, die die Durchführung der Aktivität regeln."@de ;
      rdfs:label "Regel"@de ,
                 "Regel"@sv ,
                 "Rule"@en .


###  http://activate.htwk-leipzig.de/model#Subject
:Subject rdf:type owl:Class ;
         rdfs:comment "Den person som utför denna aktivitet."@sv ,
                      "Die Person, die diese Aktivität durchführt."@de ,
                      "The person who is carrying out this activity."@en ;
         rdfs:label "Subject"@en ,
                    "Subjekt"@de ,
                    "Subjekt"@sv .

#################################################################
#    Object Properties
#################################################################

###  http://activate.htwk-leipzig.de/model#CausedByViolationOf
:CausedByViolationOf rdf:type owl:ObjectProperty ;
                     rdfs:domain :Conflict ;
                     rdfs:range :Rule ;
                     rdfs:label "Caused by a violation of"@en ,
                                "Orsakas av överträdelse av"@sv ,
                                "Verursacht durch Verletzung von"@de .


###  http://activate.htwk-leipzig.de/model#CreatesAndIsRegulatedBy
:CreatesAndIsRegulatedBy rdf:type owl:ObjectProperty ;
                         rdfs:domain :Community ;
                         rdfs:range :Rule ;
                         rdfs:label "Creates and is regulated by"@en ,
                                    "Erstellt und wird gereglt durch"@de ,
                                    "Skapar och regleras av"@sv .


###  http://activate.htwk-leipzig.de/model#DefinesRoleOf
:DefinesRoleOf rdf:type owl:ObjectProperty ;
               rdfs:domain :DivisionOfLabour ;
               rdfs:range :Subject ;
               rdfs:label "Defines role of"@en ,
                          "Definierar rollen av"@sv ,
                          "Definiert die Rolle von"@de .


###  http://activate.htwk-leipzig.de/model#DefinesTheApproachOf
:DefinesTheApproachOf rdf:type owl:ObjectProperty ;
                      rdfs:domain :Object ;
                      rdfs:range :Subject ;
                      rdfs:label "Defines the approach of"@en ,
                                 "Definierar tillvägagångssättet för"@sv ,
                                 "Definiert den Ansatz von"@de .


###  http://activate.htwk-leipzig.de/model#Determines
:Determines rdf:type owl:ObjectProperty ;
            rdfs:domain :Object ;
            rdfs:range :DivisionOfLabour ;
            rdfs:label "Bestimmt"@de ,
                       "Bestämmer"@sv ,
                       "Determines"@en .


###  http://activate.htwk-leipzig.de/model#DevelopsAndUses
:DevelopsAndUses rdf:type owl:ObjectProperty ;
                 rdfs:domain :Community, :Subject ;
                 rdfs:range :Instrument ;
                 rdfs:label "Develops and uses"@en ,
                            "Entwickelt und benutzt"@de ,
                            "Utvecklar och använder"@sv .


###  http://activate.htwk-leipzig.de/model#Has
:HasComment rdf:type owl:ObjectProperty ;
     rdfs:domain :Conflict, :Comment ;
     rdfs:range :Comment ;
     rdfs:label "Besitzt"@de ,
                "Har"@sv ,
                "Has"@en .


###  http://activate.htwk-leipzig.de/model#HasParticipant
:HasParticipant rdf:type owl:ObjectProperty ;
                rdfs:domain :Conflict ;
                rdfs:range :Community ,
                           :DivisionOfLabour ,
                           :Instrument ,
                           :Object ,
                           :Subject ,
                           :Rule ;
                rdfs:label "Har deltagare"@sv ,
                           "Has participant"@en ,
                           "Hat Teilnehmer"@de .
            

###  http://activate.htwk-leipzig.de/model#HasToFollow
:HasToFollow rdf:type owl:ObjectProperty ;
             rdfs:domain :Subject, :Community ;
             rdfs:range :Rule ;
             rdfs:label "Has to follow"@en ,
                        "Muss folgen"@de ,
                        "Måste följa"@sv .


###  http://activate.htwk-leipzig.de/model#Influences
:Influences rdf:type owl:ObjectProperty ;
            rdfs:domain :Rule ;
            rdfs:range :Object, :Community, :Subject ;
            rdfs:label "Beeinflusst"@de ,
                       "Influences"@en ,
                       "Påverkar"@sv .


###  http://activate.htwk-leipzig.de/model#InfluencesTheChoiceof
:InfluencesTheChoiceof rdf:type owl:ObjectProperty ;
                       rdfs:domain :Object ;
                       rdfs:range :Instrument ;
                       rdfs:label "Beeinflusst die Wahl von"@de ,
                                  "Influences the choice of"@en ,
                                  "Påverkar valet av"@sv .


###  http://activate.htwk-leipzig.de/model#InteractsIn
:InteractsIn rdf:type owl:ObjectProperty ;
             rdfs:domain :Subject ;
             rdfs:range :Community ;
             rdfs:label "Interacts in"@en ,
                        "Interagerar i"@sv ,
                        "Interagiert in"@de .


###  http://activate.htwk-leipzig.de/model#InteractsWith
:InteractsWith rdf:type owl:ObjectProperty ;
               rdfs:domain :Subject, :Community, :Object ;
               rdfs:range :Subject, :Community, :Object ;
               rdfs:label "Interacts with"@en ,
                          "Interagerar med"@sv ,
                          "Interagiert mit"@de .


###  http://activate.htwk-leipzig.de/model#IsAppliedToAchieve
:IsAppliedToAchieve rdf:type owl:ObjectProperty ;
                    rdfs:domain :DivisionOfLabour ;
                    rdfs:range :Object ;
                    rdfs:label "Används för att uppnå"@sv ,
                               "Is applied to achieve"@en ,
                               "Wird angewandt zum Erreichen von"@de .


###  http://activate.htwk-leipzig.de/model#IsDefinedBy
:IsDefinedBy rdf:type owl:ObjectProperty ;
             rdfs:domain :Subject ;
             rdfs:range :DivisionOfLabour ;
             rdfs:label "Is defined by"@en ,
                        "Ist definiert durch"@de ,
                        "Är definierad av"@sv .


###  http://activate.htwk-leipzig.de/model#IsDevelopedAndUsedBy
:IsDevelopedAndUsedBy rdf:type owl:ObjectProperty ;
                      rdfs:domain :Instrument ;
                      rdfs:range :Community, :Subject ;
                      rdfs:label "Is developed and used by"@en ,
                                 "Utvecklas och används av"@sv ,
                                 "Wird entwickelt und genutzt von"@de .


###  http://activate.htwk-leipzig.de/model#IsInfluencedBy
:IsInfluencedBy rdf:type owl:ObjectProperty ;
                rdfs:domain :Object ;
                rdfs:range :Rule, :Community ;
                rdfs:label "Is influenced by"@en ,
                           "Påverkas av"@sv ,
                           "Wird beeinflusst von"@de .


###  http://activate.htwk-leipzig.de/model#IsOrganisedBy
:IsOrganisedBy rdf:type owl:ObjectProperty ;
               rdfs:domain :Community ;
               rdfs:range :DivisionOfLabour ;
               rdfs:label "Is organised by"@en ,
                          "Ist organisiert durch"@de ,
                          "Är organiserad av"@sv .


###  http://activate.htwk-leipzig.de/model#IsUsedBy
:IsUsedBy rdf:type owl:ObjectProperty ;
          rdfs:domain :Instrument ;
          rdfs:range :Subject, :Community ;
          rdfs:label "Används av"@sv ,
                     "Is used by"@en ,
                     "Wird benutzt von"@de .


###  http://activate.htwk-leipzig.de/model#IsUsedOn
:IsUsedOn rdf:type owl:ObjectProperty ;
          rdfs:domain :Instrument ;
          rdfs:range :Object, :Subject ;
          rdfs:label "Används på"@sv ,
                     "Is used on"@en ,
                     "Wird angewandt auf"@de .


###  http://activate.htwk-leipzig.de/model#OperatesOn
:OperatesOn rdf:type owl:ObjectProperty ;
            rdfs:domain :Subject ;
            rdfs:range :Object ;
            rdfs:label "Fungerar på"@sv ,
                       "Operates on"@en ,
                       "Operiert auf"@de .


###  http://activate.htwk-leipzig.de/model#Organises
:Organises rdf:type owl:ObjectProperty ;
           rdfs:domain :DivisionOfLabour ;
           rdfs:range :Community ;
           rdfs:label "Organiserar"@sv ,
                      "Organises"@en ,
                      "Organisiert"@de .


###  http://activate.htwk-leipzig.de/model#RegulatesActionOf
:RegulatesActionOf rdf:type owl:ObjectProperty ;
                   rdfs:domain :Rule ;
                   rdfs:range :Subject ;
                   rdfs:label "Reglerar handlingen av"@sv ,
                              "Regulates action of"@en ,
                              "Reguliert die Handlung von"@de .


###  http://activate.htwk-leipzig.de/model#RegulatesAndIsCreatedBy
:RegulatesAndIsCreatedBy rdf:type owl:ObjectProperty ;
                         rdfs:domain :Rule ;
                         rdfs:range :Community ;
                         rdfs:label "Reglerar och skapas av"@sv ,
                                    "Regulates and is created by"@en ,
                                    "Reguliert und wird erstellt von"@de .


###  http://activate.htwk-leipzig.de/model#ShallBeAchievedBy
:ShallBeAchievedBy rdf:type owl:ObjectProperty ;
                   rdfs:domain :Object ;
                   rdfs:range :Community, :Subject ;
                   rdfs:label "Shall be achieved by"@en ,
                              "Skall uppnås genom"@sv ,
                              "Soll erreicht werden durch"@de .


###  http://activate.htwk-leipzig.de/model#Shares
:Shares rdf:type owl:ObjectProperty ;
        rdfs:domain :Community, :Subject;
        rdfs:range :Object ;
        rdfs:label "Delar"@sv ,
                   "Shares"@en ,
                   "Teilt"@de .


###  http://activate.htwk-leipzig.de/model#Uses
:Uses rdf:type owl:ObjectProperty ;
      rdfs:domain :Subject, :Community ;
      rdfs:range :Instrument ;
      rdfs:label "Använder"@sv ,
                 "Benutzt"@de ,
                 "Uses"@en .


#################################################################
#    Data properties
#################################################################

###  http://activate.htwk-leipzig.de/model#ActivityDescription
:ActivityDescription rdf:type owl:DatatypeProperty ;
                     rdfs:domain owl:Thing ;
                     rdfs:range xsd:string ;
                     rdfs:comment "The overall description of the activity."@en ;
                     rdfs:label "Activity Description"@en .


###  http://activate.htwk-leipzig.de/model#ActivityName
:ActivityName rdf:type owl:DatatypeProperty ;
              rdfs:domain owl:Thing ;
              rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#ActivityArchived
:ActivityArchived rdf:type owl:DatatypeProperty ;
                  rdfs:domain owl:Thing ;
                  rdfs:range xsd:boolean ;
                  rdfs:comment "Whether an activity is archived."@en ;
                  rdfs:label "Activity Archived"@en .


###  http://activate.htwk-leipzig.de/model#CommentDescription
:CommentDescription rdf:type owl:DatatypeProperty ;
                    rdfs:domain :Comment ;
                    rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#CommunityName
:CommunityName rdf:type owl:DatatypeProperty ;
               rdfs:domain :Community ;
               rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#ConflictTitle
:ConflictTitle rdf:type owl:DatatypeProperty ;
              rdfs:domain :Conflict ;
              rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#ConflictDescription
:ConflictDescription rdf:type owl:DatatypeProperty ;
                rdfs:domain :Conflict ;
                rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#ConflictState
:ConflictState rdf:type owl:DatatypeProperty ;
              rdfs:domain :Conflict ;
              rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#CreationDate
:CreationDate rdf:type owl:DatatypeProperty ;
              rdfs:domain :Conflict ,
                          :Comment  ;
              rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#WrittenBy
:WrittenBy rdf:type owl:DatatypeProperty ;
              rdfs:domain :Conflict ,
                          :Comment  ;
              rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#InstrumentDescription
:InstrumentDescription rdf:type owl:DatatypeProperty ;
                       rdfs:domain :Instrument ;
                       rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#InstrumentName
:InstrumentName rdf:type owl:DatatypeProperty ;
                rdfs:domain :Instrument ;
                rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#InstrumentType
:InstrumentType rdf:type owl:DatatypeProperty ;
                rdfs:domain :Instrument ;
                rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#RuleDescription
:RuleDescription rdf:type owl:DatatypeProperty ;
                 rdfs:domain :Rule ;
                 rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#RuleName
:RuleName rdf:type owl:DatatypeProperty ;
          rdfs:domain :Rule ;
          rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#SubjectAge
:SubjectAge rdf:type owl:DatatypeProperty ;
            rdfs:domain :Subject ;
            rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#SubjectName
:SubjectName rdf:type owl:DatatypeProperty ;
             rdfs:domain :Subject ;
             rdfs:range xsd:string .


###  http://activate.htwk-leipzig.de/model#SubjectSex
:SubjectSex rdf:type owl:DatatypeProperty ;
            rdfs:domain :Subject ;
            rdfs:range xsd:string .

###  Generated by the OWL API (version 4.5.29.2024-05-13T12:11:03Z) https://github.com/owlcs/owlapi
`