/**
 * Removes trailing 'turtle' and any triple backticks from a string
 * @param message - The message string to parse.
 * @returns parsed message
 */
export function parseLLMOutput(message: string): string {
    const parsedMessage = message.replace(/```(?:ttl)?/gi, '')
        .replace(/^\s*turtle:?/i, '')
        .trim();
    return parsedMessage;
}

/**
 * Writes the input to a debug log file with a timestamp in root
 */
import * as fs from 'fs';
export function writeToLog(header: string, content: string | Object): void {
    const file = fs.createWriteStream('./debug.log', { flags: 'a' });
    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2); // Format object as JSON
    }
    file.write(`${new Date().toISOString()} - ${header}\n${content}\n`);
    file.end();
}

export function clearLog(): void {
    fs.writeFileSync('./debug.log', '', 'utf8'); // Clear the log file
}