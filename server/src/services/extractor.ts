import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import officeParser from 'officeparser';

export interface ExtractionResult {
  text: string;
  sourceType: 'pdf' | 'docx' | 'pptx' | 'text';
  wordCount: number;
  preview: string;
}

/**
 * Extract clean textual content from uploaded study materials (PDF, DOCX, PPTX, or plain text).
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<ExtractionResult> {
  const extension = originalFilename.split('.').pop()?.toLowerCase() || '';
  let rawText = '';
  let detectedType: 'pdf' | 'docx' | 'pptx' | 'text' = 'text';

  try {
    if (extension === 'pdf' || mimetype.includes('pdf')) {
      detectedType = 'pdf';
      const pdfData = await pdfParse(fileBuffer);
      rawText = pdfData.text || '';
    } else if (extension === 'docx' || mimetype.includes('wordprocessingml') || mimetype.includes('msword')) {
      detectedType = 'docx';
      const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
      rawText = docxResult.value || '';
    } else if (
      extension === 'pptx' ||
      extension === 'ppt' ||
      mimetype.includes('presentationml') ||
      mimetype.includes('powerpoint')
    ) {
      detectedType = 'pptx';
      // officeParser handles pptx buffers cleanly
      try {
        const parsed = await officeParser.parseOfficeAsync(fileBuffer);
        rawText = typeof parsed === 'string' ? parsed : String(parsed || '');
      } catch (err) {
        console.warn('officeParser failed, falling back to text regex scan:', err);
        // Fallback for pptx XML archives if officeParser has issues
        rawText = fileBuffer.toString('utf-8').replace(/<[^>]+>/g, ' ');
      }
    } else {
      // Plain text, Markdown, etc.
      detectedType = 'text';
      rawText = fileBuffer.toString('utf-8');
    }
  } catch (error: any) {
    console.error(`Error parsing ${detectedType} file:`, error);
    throw new Error(
      `We had trouble reading your ${detectedType.toUpperCase()} file ("${originalFilename}"). Please ensure it's not password-protected or corrupted, or try copying and pasting the text directly!`
    );
  }

  // Clean and normalize text
  const cleanText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 15) {
    throw new Error(
      `We found very little text in "${originalFilename}" (${wordCount} words detected). Please ensure your document contains lecture notes, slides, or study text, or paste your material directly into the text box!`
    );
  }

  // Generate preview snippet (first 300 characters)
  const preview = cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : '');

  return {
    text: cleanText,
    sourceType: detectedType,
    wordCount,
    preview,
  };
}

/**
 * Clean and validate user-pasted text
 */
export function extractFromRawText(rawInput: string): ExtractionResult {
  const cleanText = rawInput
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 15) {
    throw new Error(
      'Your pasted notes are a bit too short for a meaningful quiz. Please paste at least a paragraph or a few key concepts (15+ words).'
    );
  }

  return {
    text: cleanText,
    sourceType: 'text',
    wordCount,
    preview: cleanText.slice(0, 300) + (cleanText.length > 300 ? '...' : ''),
  };
}
