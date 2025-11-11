// WICHTIG: Sie müssen diese Bibliothek in 'feedback-parser' installieren:
// npm install @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeToLog } from "./utils.js"; // Importieren Ihrer Logging-Funktion
import { logFilenames } from "../data/staticContent.js"; // Importieren Ihrer Log-Dateinamen

/**
 * Definiert die JSON-Struktur, die wir von Gemini zurückerwarten.
 */
interface RoleMapping {
    speaker_id: string; // z.B. "SPEAKER_00"
    role: string;       // z.B. "Lehrperson"
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

// Holen Sie den API-Schlüssel (muss in feedback-parser/.env gesetzt sein)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn("WARNUNG: GEMINI_API_KEY ist in feedback-parser/.env nicht gesetzt. Die Rollenzuordnung wird fehlschlagen.");
}

// Initialisiert das Gemini-Modell
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "dummy-key");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025",
    // Wir zwingen Gemini, JSON auszugeben (deshalb verwenden wir nicht Ihre alte queryGemini-Funktion)
    generationConfig: { responseMimeType: "application/json" }
});

/**
 * Ruft die Gemini-API auf, um anonyme Sprecher (speaker_00) basierend auf
 * Heuristiken und einer vordefinierten Rollenliste zuzuordnen.
 *
 * @param speakerTextMap Ein Objekt, das speaker_id auf den gesamten gesprochenen Text abbildet.
 * @param sessionRoles Eine Liste der in der Sitzung verfügbaren Rollen (z.B. ['Lehrperson', 'Schauspieler', ...])
 * @returns Ein Array von RoleMapping-Objekten.
 */
export async function callGeminiAPI(
    speakerTextMap: { [key: string]: string },
    sessionRoles: string[]
): Promise<RoleMapping[]> {

    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured on the server.");
    }

    // Die 4 Haupt-Rollentypen (Ihre Heuristik-Kategorien aus Ihrem Plan)
    const roleTypes = [
        "Lehrperson",
        "Schauspieler",
        "Lernender (Spieler)", // Derjenige, der das Feedback erhält
        "Lernender (Beobachter)" // Der Rest
    ];

    // Dies ist der System-Prompt, der Ihren Plan exakt umsetzt:
    const systemPrompt = `
Du bist ein Analyse-Assistent für medizinisches Training. Deine Aufgabe ist es, anonyme Sprecher (z.B. "SPEAKER_00", "SPEAKER_01") anhand des Kontexts einem Rollentyp zuzuordnen.
Die Szene ist ein Feedback-Gespräch nach einem Rollenspiel.
Die vollständige Liste der *möglichen* anwesenden Personen (falls relevant) ist: ${sessionRoles.join(', ')}.
Die 4 *Haupt-Rollentypen*, die du zuordnen sollst, sind: ${roleTypes.join(', ')}.

Hier sind die Heuristiken zur Identifizierung der 4 Haupt-Rollentypen:
1.  **Lehrperson:** Moderiert, eröffnet/beendet die Runde, stellt Fragen (z.B. "Wie fandest du...", "Was denkst du..."), fasst zusammen. (Bezieht sich oft auf 'Ausbilder' oder 'Instructor' in der Rollenliste).
2.  **Schauspieler:** Spricht aus der Ich-Perspektive des Patienten (z.B. "Ich als Patient", "Ich habe gespürt...", "Ich fühlte mich..."). Spricht oft nur einmal.
3.  **Lernender (Spieler):** Gibt eine Selbst-Einschätzung zur eigenen Leistung (z.B. "Ich war unsicher", "Ich habe versucht...", "Ich fand es schwierig..."). Dies ist die Person, die das Feedback erhält.
4.  **Lernender (Beobachter):** Gibt Feedback direkt an den Spieler in der "Du"-Form (z.B. "Du hast gut erklärt", "Du warst...", "Ich fand, du..."). Dies sind oft die meisten anderen Rollen (Arzt 01-04, Pflegekraft 01-04 etc.).

Analysiere den folgenden JSON-Input, der den gesamten Text pro Sprecher enthält.
Ordne JEDEM Sprecher einen der 4 Haupt-Rollentypen ("Lehrperson", "Schauspieler", "Lernender (Spieler)", "Lernender (Beobachter)") UND einen Konfidenz-Score (high, medium, low) zu.

Gib deine Antwort NUR als valides JSON-Array im folgenden Format zurück. Fasse für 'reason' kurz zusammen, warum du dich entschieden hast:
[
  { "speaker_id": "SPEAKER_00", "role": "Lehrperson", "confidence": "high", "reason": "Stellt moderierende Fragen." },
  { "speaker_id": "SPEAKER_01", "role": "Lernender (Spieler)", "confidence": "medium", "reason": "Gibt Selbst-Einschätzung." }
]
`;

    // Der User-Prompt enthält nur die Daten (den konsolidierten Text pro Sprecher)
    const userPrompt = JSON.stringify(speakerTextMap);

    // Logging der Anfrage (optional, aber nützlich)
    writeToLog(logFilenames.misc, "Gemini Role Mapping Request (Prompt):", systemPrompt);
    writeToLog(logFilenames.misc, "Gemini Role Mapping Request (Data):", userPrompt);

    try {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const responseText = result.response.text();
        
        // Logging der Antwort
        writeToLog(logFilenames.misc, "Gemini Role Mapping Response (Raw):", responseText);

        // Parse das JSON, das Gemini zurückgibt
        const jsonResponse: RoleMapping[] = JSON.parse(responseText);
        return jsonResponse;

    } catch (error) {
        console.error("Fehler beim Aufruf der Gemini-API oder beim Parsen der JSON-Antwort:", error);
        const safeError = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : (typeof error === 'object' && error !== null ? error : String(error));
        writeToLog(logFilenames.misc, "Gemini Role Mapping ERROR:", safeError);
        // Fallback: Wenn Gemini fehlschlägt, geben wir eine leere Zuordnung zurück
        // (Das Frontend zeigt dann "SPEAKER_00" etc. an)
        return [];
    }
}