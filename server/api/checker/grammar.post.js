
import {defineEventHandler, readBody, } from 'h3'
import { IncompleteJsonParser } from 'incomplete-json-parser';


async function checkGrammar(text, ACCOUNT_ID, AUTH_TOKEN) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`

  const payload = {
    messages: [
      {
        role: "system",
        content: `You are a grammar validation expert. Analyze text for grammatical errors and return JSON responses strictly following these rules:
  1. Return ONLY valid JSON (no markdown, no extra text)
  2. Response structure must be:
  {
    "check": "PASSED"|"FAILED",
    "errors": [
      "Error description with correction",
      "Second error description",
      ...
    ]
  }
  3. For "errors" array:
  - Use plain strings without numbering
  - Format: [Verb] should be [correction] because [reason]
  - Include exact location in text when possible
  - List maximum 5 most critical errors if multiple exist
  
  Examples:
  Valid PASSED response:
  {"check": "PASSED", "errors": []}
  
  Valid FAILED response:
  {
    "check": "FAILED",
    "errors": [
      "Verb 'runned' should be 'ran' (past tense of run) in phrase 'dog who runned'",
      "Missing article 'a' before 'cat' in sentence 'They saw cat'"
    ]
  }`
      },
      {
        role: "user",
        content: `Analyze this text for grammatical errors and return ONLY the JSON response:\n\n${text}`
      }
    ]
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      body: JSON.stringify(payload)
    })
    const data = await response.json()
    return await extractErrorStatus(data.result.response, ACCOUNT_ID, AUTH_TOKEN)
  } catch (error) {
    console.error("Error in checkGrammar:", error)
    return {
      check: "FAILED",
      errors: [error.message]
    }
  }
}

function extractJsonString(text) {
  // Preprocess text to fix common JSON issues
  const sanitizedText = text
    .replace(/"errors"\s*:\s*"\s*\[/g, '"errors": [') // Fix malformed array start
    .replace(/"errors"\s*:\s*"([^"]*)"/g, '"errors": ["$1"]') // Convert string to array
    .replace(/(\d+)\.\s*("[^"]*")/g, '$2') // Remove numbered list prefixes

  const parser = new IncompleteJsonParser()
  try {
    parser.write(sanitizedText)
    const objects = parser.getObjects()
    if (objects.length > 0) {
      return JSON.stringify(objects[0])
    }
  } catch (e) { /* Proceed to manual parsing */ }

  // Manual parsing logic with enhanced error handling
  let startIndex = sanitizedText.indexOf('{')
  if (startIndex === -1) return null

  let stack = []
  let inString = false
  let escapeNext = false
  let endIndex = -1

  for (let i = startIndex; i < sanitizedText.length; i++) {
    const char = sanitizedText[i]
    if (escapeNext) {
      escapeNext = false
      continue
    }
    if (char === '\\') {
      escapeNext = true
      continue
    }
    if (char === '"') inString = !inString
    if (!inString) {
      if (char === '{') stack.push(char)
      else if (char === '}') {
        if (stack.length === 0) break
        stack.pop()
        if (stack.length === 0) {
          endIndex = i
          break
        }
      }
    }
  }

  if (endIndex !== -1) {
    const candidate = sanitizedText.substring(startIndex, endIndex + 1)
    try {
      JSON.parse(candidate)
      return candidate
    } catch (e) {
      try {
        const fallbackParser = new IncompleteJsonParser()
        fallbackParser.write(candidate)
        const objects = fallbackParser.getObjects()
        if (objects.length > 0) return JSON.stringify(objects[0])
      } catch (parserError) { /* Continue */ }
    }
  }

  // Handle incomplete JSON
  if (stack.length > 0) {
    const candidate = sanitizedText.substring(startIndex) + '"}'
    try {
      const fallbackParser = new IncompleteJsonParser()
      fallbackParser.write(candidate)
      const objects = fallbackParser.getObjects()
      if (objects.length > 0) return JSON.stringify(objects[0])
    } catch (e) {
      const fixedCandidate = candidate.replace(/(\s*"[^"]*"\s*:\s*[^,}]*)(\s*)$/, '$1}')
      try {
        JSON.parse(fixedCandidate)
        return fixedCandidate
      } catch (e) {
        const validPart = candidate.match(/\{"check":"[^"]*","errors":\[[^\]]*\]/)
        if (validPart) return validPart[0] + ']}'
      }
    }
  }

  return null
}

async function extractErrorStatus(response,ACCOUNT_ID, AUTH_TOKEN) {
  const result = { check: "UNKNOWN", errors: [] }
  let jsonString = null

  if (typeof response === "string") {
    jsonString = extractJsonString(response)
  } else if (typeof response === "object") {
    jsonString = JSON.stringify(response)
  }

  // Try parsing the JSON response
  try {
    const responseObj = jsonString ? JSON.parse(jsonString) : response
    if (responseObj.check && Array.isArray(responseObj.errors)) {
      return {
        check: responseObj.check.toUpperCase(),
        errors: responseObj.errors
      }
    }
  } catch (e) { /* Proceed to fallback */ }

  // Fallback 1: Direct error extraction from string
  const responseStr = typeof response === "string" ? response : JSON.stringify(response)
  result.check = (responseStr.match(/(PASSED|FAILED)/i)?.[1] || "UNKNOWN").toUpperCase()

  // Enhanced error extraction
  const errorRegex = /"errors"\s*:\s*\[([^\]]*)\]/gis
  const errorMatch = errorRegex.exec(responseStr)
  if (errorMatch) {
    try {
      const rawErrors = errorMatch[1]
        .split(/",\s*"/)
        .map(e => e.replace(/^"|"$/g, '').trim())
        .filter(e => e)
      result.errors = rawErrors
    } catch {
      result.errors = [errorMatch[1].replace(/"/g, '').trim()]
    }
  }

  // Fallback 2: Handle incomplete errors array
  if (result.errors.length === 0) {
    const incompleteMatch = responseStr.match(/"errors"\s*:\s*\[([^]*)$/)
    if (incompleteMatch) {
      result.errors = incompleteMatch[1]
        .split(/",\s*"/)
        .map(e => e.replace(/^"|"$/g, '').trim())
        .filter(e => e)
    }
  }

  // Final fallback: API-based recovery
  if (result.check === "FAILED" && result.errors.length === 0) {
    try {
      const fallbackErrors = await fetchErrorsFromFallbackAPI(responseStr, ACCOUNT_ID, AUTH_TOKEN)
      result.errors = fallbackErrors
    } catch (e) {
      console.error("Fallback API error:", e)
    }
  }

  return result
}

async function fetchErrorsFromFallbackAPI(responseStr, ACCOUNT_ID, AUTH_TOKEN) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`;
  const payload = {
    messages: [
      {
        role: "system",
        content: "Extract ONLY the errors array from this malformed JSON. Return a valid JSON array."
      },
      {
        role: "user",
        content: `Extract errors array from:\n${responseStr}\nReturn ONLY JSON array:`
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    
    // First try direct JSON parsing
    try {
      return JSON.parse(data.result.response);
    } catch (e) {
      // Fallback to pattern matching if JSON parsing fails
      const errorMatch = data.result.response.match(
        /(?:errors?|mistakes)\s*:\s*\[([^\]]*)\]/i
      );
      
      if (errorMatch) {
        // Extract and clean the errors
        return errorMatch[1]
          .split(',')
          .map(error => error
            .replace(/['"]/g, '')
            .trim()
          )
          .filter(error => error.length > 0);
      }
      
      // Final fallback: look for list-like patterns
      const listItems = data.result.response.match(
        /(?:\d+\.\s*|-\s*)(["']?)(.*?)\1/g
      );
      
      if (listItems) {
        return listItems.map(item => 
          item.replace(/^\d+\.\s*|-\s*|['"]/g, '').trim()
        );
      }
    }
    
    // If all else fails return empty array
    return [];
  } catch (error) {
    console.error("Fallback API error:", error);
    return [];
  }
}



export default defineEventHandler(async(event) => {
    const {text} = await readBody(event)
    // const config = useRuntimeConfig(event)
    // console.log(config.CLOUDFLARE_ACC_ID, config.CLOUDFLARE_API_TOKEN)
    const {CLOUDFLARE_ACC_ID:ACCOUNT_ID, CLOUDFLARE_API_TOKEN: AUTH_TOKEN } = useRuntimeConfig(event);

    const response = await checkGrammar(text,ACCOUNT_ID,AUTH_TOKEN )

    return response
})