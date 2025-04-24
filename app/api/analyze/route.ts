import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as XLSX from "xlsx";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { mkdir } from "fs/promises";

// Remove edge runtime to use Node.js runtime
// export const runtime = 'edge';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file") as File;
    const userPrompt = formData.get("prompt") as string;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
      // Upload file to OpenAI
      const file = await openai.files.create({
        file: uploadedFile,
        purpose: "assistants",
      });

      // Wait for file to be processed
      let fileStatus = await openai.files.retrieve(file.id);
      while (fileStatus.status !== 'processed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fileStatus = await openai.files.retrieve(file.id);
      }

      // Create an assistant
      const assistant = await openai.beta.assistants.create({
        name: "Business Document Analyzer",
        instructions: `
Extract all relevant information from the attached document into a simple two-column table:
- Column 1: Information Type (e.g., "Customer Name,Contract Start Date", "Service Description", "Payment Terms,  contract start and end date, contract amount, standard billing rates, standard billing rates, AP contract information, renewal terms, service level agreements etc")
- Column 2: Extracted Detail (the actual value or description)

Guidelines:
1. Extract all important information you find in the document
2. Use clear, descriptive names for the Information Type
3. Keep the details concise but complete
4. Format dates as MM/DD/YYYY
5. Include currency symbols for monetary values
6. Use bullet points for multiple related items
7. Maintain consistent spacing

Focus on extracting factual information rather than interpreting it.`,
        model: "gpt-4-1106-preview",
        tools: [{ type: "code_interpreter" }]
      });

      // Create a thread
      const thread = await openai.beta.threads.create();

      // Add a message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userPrompt || "Please analyze this business document and provide insights.",
        attachments: [{
          file_id: file.id,
          tools: [{ type: "code_interpreter" }]
        }]
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
      });

      // Wait for the run to complete
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status !== 'completed') {
        if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed: ' + runStatus.last_error?.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      // Get the messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];
      const analysisText = typeof lastMessage.content[0] === 'object' && 'text' in lastMessage.content[0]
        ? lastMessage.content[0].text.value
        : '';

      // Clean up
      await openai.files.del(file.id);
      await openai.beta.assistants.del(assistant.id);

      // Generate spreadsheet
      const workbook = XLSX.utils.book_new();
      
      // Parse the response and structure it for Excel
      const rows = parseAnalysisIntoRows(analysisText);
      
      // Create worksheet with the parsed data
      const worksheet = XLSX.utils.json_to_sheet(rows);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contract Analysis');
      
      // Generate Excel file as base64
      const base64Data = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx"
      });
      
      // Return the base64 data
      return NextResponse.json({ 
        excelData: base64Data,
        filename: `${uploadedFile.name.replace(/\.[^/.]+$/, "")}_analysis_${new Date().getTime()}.xlsx`
      });
    } catch (error) {
      console.error('Error processing file:', error);
      return NextResponse.json(
        { error: 'Failed to process file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

// Helper function to parse the analysis text into rows for Excel
function parseAnalysisIntoRows(analysisText: string) {
  try {
    // First attempt to parse if it's already in JSON format
    try {
      const jsonData = JSON.parse(analysisText);
      if (Array.isArray(jsonData)) {
        return jsonData;
      }
      // If it's a nested object, convert to array of row objects
      return Object.entries(jsonData).map(([key, value]) => ({
        Category: key,
        Value: typeof value === "object" ? JSON.stringify(value) : value,
      }));
    } catch (e) {
      // If not valid JSON, split by lines and attempt to create rows
      const lines = analysisText.split("\n").filter((line) => line.trim());

      // Check if we have clear section headings
      const sections: Record<string, string[]> = {};
      let currentSection = "General";
      sections[currentSection] = [];

      for (const line of lines) {
        if (
          line.startsWith("#") ||
          line.startsWith("**") ||
          /^[A-Z][A-Za-z\s]+:$/.test(line)
        ) {
          // This looks like a heading
          currentSection = line.replace(/[#*:]/g, "").trim();
          sections[currentSection] = [];
        } else if (line.includes(":")) {
          sections[currentSection].push(line);
        } else {
          sections[currentSection].push(line);
        }
      }

      // Convert sections to rows
      const rows: Record<string, string>[] = [];

      // Add a summary row
      rows.push({
        Category: "Document Analysis Summary",
        Details: "Analysis of business agreement document",
      });

      // Process each section
      Object.entries(sections).forEach(([section, lines]) => {
        // Add a section header row
        rows.push({
          Category: section,
          Details: "",
        });

        // Process lines in this section
        lines.forEach((line) => {
          const parts = line.split(":");
          if (parts.length > 1) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(":").trim();
            rows.push({
              Category: key,
              Details: value,
            });
          } else {
            // Just a text line, add as is
            rows.push({
              Category: "",
              Details: line.trim(),
            });
          }
        });
      });

      return rows;
    }
  } catch (error) {
    // Fallback - create a simple one-row response
    return [
      {
        Category: "Analysis",
        Details: analysisText,
      },
    ];
  }
}
