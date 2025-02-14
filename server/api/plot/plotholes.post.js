import { defineEventHandler, readBody } from 'h3'
import fs from 'fs'
import path from 'path'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  // Read the request body
  const body = await readBody(event)

  // Determine if the body is an object (assume JSON) or a string
  const isJson = typeof body === 'object'
  const mimeType = isJson ? 'text/json' : 'text/plain'

  // Convert the body to a string
  const fileContent = isJson ? JSON.stringify(body, null, 2) : String(body)

  // Create a temporary file path
  const tempFileName = `request_body.${isJson ? 'json' : 'txt'}`
  // You may adjust the temporary directory as needed
  const tempFilePath = path.join('/tmp', tempFileName)
  const apiKey = useRuntimeConfig(event).GEMINI_API_KEY

  // Write the file content to the temporary file
  fs.writeFileSync(tempFilePath, fileContent, 'utf8')

  // Instantiate the file manager and upload the file
  const fileManager = new GoogleAIFileManager(apiKey)
  const uploadResult = await fileManager.uploadFile(tempFilePath, {
    mimeType,
    displayName: 'Request Body File'
  })
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  )


  // Instantiate the Generative AI client and select the Gemini model
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
    systemInstruction: `
        You are a narrative analysis AI designed to detect inconsistencies, plot holes, and narrative gaps within a story's structure. You will receive a JSON object that contains structured plot chains. Each plot chain consists of nodes with the following properties:

- **level**: An integer representing the position of the node in the hierarchy (0 for the root, increasing for child nodes).
- **role**: A string describing the function of the node, which may be "root plot," "child plot," or "descendant to check."
- **title**: A brief title summarizing the plot element.
- **summary**: A concise description of the plot element.
- **checkFocus**: A boolean (true/false). If true, this plot is a primary focus for detecting plotholes.
- **main-content**: A consolidated version of the full narrative text, built from all relevant plot elements.

### **Your Analysis Process:**
1. **Prioritize "checkFocus" Plots:**  
   - Give **greater analytical weight** to nodes where -- checkFocus: true --.  
   - These plots are **directly linked to the "main-content"**, meaning they are critical parts of the main story.  
   - Any inconsistencies or gaps found in these plots should be flagged as **high priority**.  

2. **Analyze Supporting Plots (Subplots & Continuations):**  
   - For other plots ( -- checkFocus: false --), consider them as **subplots or background context**.  
   - Analyze whether they logically connect to the main text and if they create any unintended contradictions.  
   - If there are inconsistencies between a subplot and the main narrative, flag them as **secondary issues** unless they significantly impact the main plot.

3. **Identify & Report Plotholes:**  
   - Cross-check events, character motivations, and logic flows within and between the plot chains.  
   - Detect missing or contradictory information that might break continuity.  
   - Pay special attention to unresolved plotlines, contradictions, or elements that lack proper setup/payoff.  

4. **Provide a Structured Output:**  
   - **List of detected plotholes**, categorized by priority (High: Main Plot, Medium: Subplots).  
   - **Affected sections** (title and role of the problematic plot elements).  
   - **Recommendations** to resolve these plotholes (e.g., clarifications, foreshadowing, additional scenes).  
   - Ensure clarity by structuring output as bullet points or a numbered list.

By following this approach, your analysis will focus on the key narrative components while ensuring coherence across all levels of the story.

Now, proceed with the analysis.
    `
   })

  // Call the model with the uploaded file reference
  const result = await model.generateContent([
    "Look For Plotholes/loopholes/inconsistency in the main-content of the file",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType
      }
    }
  ])

  //delete the file from the file manager given  the id
  await fileManager.deleteFile(uploadResult.file.name)

  // Return the result from the Gemini API
  return {result: result.response.text()}
})
