/**
 * Stolen code from https://github.com/IDLabResearch/TurtleValidator
 * Has been modified to work with TypeScript and be used within the text-ttl-backend.
 * Usage of the turtle-validator npm package wasn't not possible due to the lack of TypeScript support
 * and Express not caring about separate d.ts. typing.
 */

import { Parser, Quad } from 'n3'
import { LLMQueryResult, queryLLM, writeToLog } from './utils.js'
import { LLM } from '../data/types.js'
import { ttlSyntaxFixPrompt } from '../data/prompts.js'

type Feedback = {
    warnings: string[]
    errors: string[]
}

const regexp: Record<string, RegExp> = {
    dateTime:
        /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[0-1]|0[1-9]|[1-2][0-9])?T(2[0-3]|[0-1][0-9]):([0-5][0-9]):([0-5][0-9])(\.[0-9]+)?(Z|[+-](?:2[0-3]|[0-1][0-9]):[0-5][0-9])?$/,
    double: /[-+]?\d*([.]\d+)?/,
    float: /[-+]?\d*[.]\d+/,
    int: /^[-+]?(0|[1-9]\d*)$/,
}

export async function validateTTLObject(obj: Record<string, string>, logFileName: string, llm: LLM): Promise<Record<string, string> | LLMQueryResult | undefined> {
    let validateCount = 0;
    let validated = false;
    for (const key of Object.keys(obj) as (keyof typeof obj)[]) {
        do {
            validateCount++;
            if (validateCount > 5) {
                return undefined;
            }
            let validatorResult = await validate(obj[key]);
            writeToLog(logFileName, "Validator Call #" + validateCount, validatorResult)
            if (validatorResult.errors.length > 0) {
                const fixedTTLResult = await queryLLM(llm, ttlSyntaxFixPrompt, obj[key] + '\n' + JSON.stringify(validatorResult.errors), logFileName);
                if (!fixedTTLResult.ok || !fixedTTLResult.response) {
                    return fixedTTLResult;
                }
                obj[key] = fixedTTLResult.response;
            } else {
                validated = true;
            }
        } while (!validated)
        // Return generated TTL
    }
    return obj;
}

export async function validate(turtle: string): Promise<Feedback> {
    const parser = new Parser({ format: 'text/turtle' })
    const feedback: Feedback = { warnings: [], errors: [] }

    return new Promise((resolve) => {
        parser.parse(turtle, (error, triple: Quad | null) => {
            if (error) {
                feedback.errors.push(error.message)
            }

            if (triple) {
                if (triple.object.termType === 'Literal') {
                    const value = triple.object.value
                    let type = triple.object.datatype.value
                    type = type.replace('http://www.w3.org/2001/XMLSchema#', '')
                    if (regexp[type] && !regexp[type].test(value)) {
                        feedback.warnings.push(
                            `xsd:${type} does not validate for literal. {${triple.subject.value}, ${triple.predicate.value}, ${triple.object.value}}`
                        )
                    }
                }
            } else {
                resolve(feedback)
            }
        })
    })
}