import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import * as XLSX from "xlsx";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Core instructions for file analysis
const ANALYSIS_PROMPT = `
Please read the uploaded document and extract ALL relevant business contract information.

Return the result as a Markdown table with:
- Column 1: Field Name
- Column 2: Field Value

Rules:
1. Each field must be on its own row
2. Do not combine multiple values in one cell
3. If a field has multiple values, create a separate row for each value
4. Keep field names clear and descriptive
5. Format dates as MM/DD/YYYY
6. Include currency symbols for monetary values

Example format:
| Field Name | Field Value |
|------------|-------------|
| Customer Name | Acme Corp |
| Contract Start Date | 01/01/2024 |
| Service Description | Cloud Hosting |
| Payment Terms | Net 30 |
| Billing Rate | $100/hour |

Only return the Markdown table. Do not summarize or explain anything.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFile = formData.get("file") as File;
    const userPrompt = formData.get("prompt") as string;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (Netlify has a 10MB limit for serverless functions)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 413 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');

    // Create completion request
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: ANALYSIS_PROMPT
            },
            {
              type: "file",
              file: {
                filename: uploadedFile.name,
                file_data: `data:application/pdf;base64,${base64File}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0
    });

    const analysisText = completion.choices[0]?.message?.content || "";
    console.log(analysisText);
    // Parse Markdown table into Excel rows
    const rows = parseMarkdownTableToRows(analysisText);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    const wscols = [
      { wch: 30 }, // Field Name column
      { wch: 50 }  // Field Value column
    ];
    worksheet['!cols'] = wscols;

    // Add worksheet to workbook with proper formatting
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contract Analysis");

    // Convert to base64
    const base64Data = XLSX.write(workbook, {
      type: "base64",
      bookType: "xlsx",
      cellStyles: true,
      cellDates: true,
      bookSST: true
    });

    // Return response
    const timestamp = new Date().getTime();
    const filename = `${uploadedFile.name.replace(/\.[^/.]+$/, "")}_analysis_${timestamp}.xlsx`;

    return NextResponse.json({
      resultUrl: null,
      excelData: base64Data,
      filename,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

// Helper to convert Markdown 2-row table into JSON rows for Excel
function parseMarkdownTableToRows(markdown: string) {
  const lines = markdown.split("\n").filter(l => l.trim() && l.includes("|"));
  if (lines.length < 3) {
    return [{ "Field Name": "Raw Output", "Field Value": markdown }];
  }

  // Skip the header separator line (the line with dashes)
  const dataLines = lines.filter(line => !line.includes("---"));
  
  // Process each data line
  const rows = dataLines.map(line => {
    const cells = line.split("|").map(cell => cell.trim()).filter(Boolean);
    if (cells.length >= 2) {
      return {
        "Field Name": cells[0],
        "Field Value": cells[1]
      };
    }
    return null;
  }).filter(Boolean);

  return rows;
}
