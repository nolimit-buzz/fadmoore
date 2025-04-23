import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as XLSX from 'xlsx';
import { writeFile } from 'fs/promises';
import path from 'path';

// Remove edge runtime to use Node.js runtime
// export const runtime = 'edge';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userPrompt = formData.get('prompt') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString('base64');

    // Prepare system prompt for analysis
    const systemPrompt = `
      You are an expert business analyst specialized in analyzing business agreements and contracts.
      Analyze the provided document and extract key information that would help determine if the client will be a returning customer.
      Focus on identifying terms, conditions, pricing, duration, commitments, and any other factors that may indicate long-term business relationship potential.
      Format your response as structured data that can be converted to an Excel spreadsheet.
    `;

    // Combine system prompt with user prompt if provided
    const combinedPrompt = userPrompt
      ? `${systemPrompt}\n\nAdditional requirements: ${userPrompt}`
      : systemPrompt;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: combinedPrompt,
        },
        {
          role: 'user',
          content: `Please analyze this business document and provide insights. Document content: ${fileContent}`,
        },
      ],
      temperature: 0.3,
    });

    // Extract insights from response
    const analysisText = response.choices[0].message.content || '';
    console.log("ANALYSIS TEXT", analysisText);
    
    // Generate spreadsheet
    const workbook = XLSX.utils.book_new();
    
    // Parse the response and structure it for Excel
    const rows = parseAnalysisIntoRows(analysisText);
    
    // Create worksheet with the parsed data
    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Client Insights');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `${file.name.replace(/\.[^/.]+$/, '')}_analysis_${timestamp}.xlsx`;
    const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
    
    // Save the file
    await writeFile(filePath, excelBuffer);
    
    // Also generate base64 for immediate download
    const base64Data = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    
    // Return both the URL and base64 data
    return NextResponse.json({ 
      resultUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/downloads/${filename}`,
      excelData: base64Data,
      filename: filename
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
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
        Value: typeof value === 'object' ? JSON.stringify(value) : value,
      }));
    } catch (e) {
      // If not valid JSON, split by lines and attempt to create rows
      const lines = analysisText.split('\n').filter(line => line.trim());
      
      // Check if we have clear section headings
      const sections: Record<string, string[]> = {};
      let currentSection = 'General';
      sections[currentSection] = [];
      
      for (const line of lines) {
        if (line.startsWith('#') || line.startsWith('**') || /^[A-Z][A-Za-z\s]+:$/.test(line)) {
          // This looks like a heading
          currentSection = line.replace(/[#*:]/g, '').trim();
          sections[currentSection] = [];
        } else if (line.includes(':')) {
          sections[currentSection].push(line);
        } else {
          sections[currentSection].push(line);
        }
      }
      
      // Convert sections to rows
      const rows: Record<string, string>[] = [];
      
      // Add a summary row
      rows.push({
        Category: 'Document Analysis Summary',
        Details: 'Analysis of business agreement document',
      });
      
      // Process each section
      Object.entries(sections).forEach(([section, lines]) => {
        // Add a section header row
        rows.push({
          Category: section,
          Details: '',
        });
        
        // Process lines in this section
        lines.forEach(line => {
          const parts = line.split(':');
          if (parts.length > 1) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            rows.push({
              Category: key,
              Details: value,
            });
          } else {
            // Just a text line, add as is
            rows.push({
              Category: '',
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
        Category: 'Analysis',
        Details: analysisText,
      }
    ];
  }
}