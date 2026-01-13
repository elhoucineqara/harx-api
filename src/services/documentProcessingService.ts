import * as fs from 'fs/promises';
import * as path from 'path';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

/**
 * Extract text from a file based on its type
 * @param filePath - Path to the file
 * @param fileType - MIME type of the file
 * @returns Extracted text content
 */
export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    console.log(`Extracting text from ${filePath} of type ${fileType}`);
    
    // Handle different file types
    switch (fileType) {
      case 'application/pdf':
        return extractTextFromPdf(filePath);
        
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return extractTextFromWord(filePath);
        
      case 'text/plain':
        return extractTextFromTxt(filePath);
        
      case 'text/markdown':
      case 'text/html':
        return extractTextFromTxt(filePath); // Simple text extraction for markdown and HTML
        
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error: any) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extract text from a PDF file using pdfjs-dist
 * @param filePath - Path to the PDF file
 * @returns Extracted text content
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(dataBuffer);
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error(`Error extracting text from PDF ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extract text from a Word document
 * @param filePath - Path to the Word document
 * @returns Extracted text content
 */
async function extractTextFromWord(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error: any) {
    console.error(`Error extracting text from Word document ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extract text from a plain text file
 * @param filePath - Path to the text file
 * @returns Extracted text content
 */
async function extractTextFromTxt(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error: any) {
    console.error(`Error extracting text from text file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Calculate basic document metrics
 * @param text - Document text content
 * @returns Document metrics
 */
export function calculateDocumentMetrics(text: string) {
  const wordCount = text.split(/\s+/).length;
  const characterCount = text.length;
  const sentenceCount = text.split(/[.!?]+/).length - 1;
  const paragraphCount = text.split(/\n\s*\n/).length;
  
  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    averageWordLength: characterCount / wordCount,
    averageSentenceLength: wordCount / (sentenceCount || 1),
    averageParagraphLength: wordCount / (paragraphCount || 1)
  };
}
