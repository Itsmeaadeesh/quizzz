import { QuizConfig, QuizQuestion, GeneratedQuiz } from '../types';
import { supabase } from './supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Reliable Gemini models in priority order based on live testing.
 * gemini-3.5-flash-lite and gemini-3.5-flash provide instant sub-second responses without 503 spikes.
 */
const PRIORITY_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

/**
 * Converts a browser File into a base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an active-recall quiz directly via Gemini API
 */
export async function generateQuizWithGeminiDirect(params: {
  file?: File;
  rawText?: string;
  directText?: string;
  sourceName?: string;
  sourceType?: string;
  config: QuizConfig;
  userId?: string;
}): Promise<GeneratedQuiz> {
  const { file, rawText, directText, config, userId } = params;
  const sourceName = params.sourceName || (file ? file.name : 'Study Notes');
  const sourceType = params.sourceType || (file ? file.name.split('.').pop() || 'text' : 'text');

  let textContent = directText || rawText || '';
  let pdfBase64: string | null = null;

  if (file) {
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      try {
        pdfBase64 = await fileToBase64(file);
      } catch (e) {
        console.warn('Could not encode PDF to base64, reading text fallback:', e);
      }
    } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      textContent = await file.text();
    }
  }

  // Generate dynamic anti-repetition seed
  const variationSeed = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Construct master educator prompt
  const systemPrompt = `
You are StayAheadd's master educator AI. Your task is to analyze the student's study material and generate an engaging, highly accurate quiz.

QUIZ SPECIFICATIONS:
- Target number of questions: ${config.numQuestions}
- Question format: ${config.questionType.toUpperCase()} (options: 'mcq', 'true_false', 'short_answer', or 'mixed')
- Target difficulty: ${config.difficulty.toUpperCase()}
- Document title: "${sourceName}"
- Anti-repetition seed: ${variationSeed}

CRITICAL VARIETY & DIVERSITY RULES:
1. Every time a quiz is generated, generate FRESH, NOVEL questions covering different subtleties, mechanisms, equations, dates, definitions, and applications.
2. Avoid standard repetitive questions. Explore different conceptual angles and test active understanding rather than rote repetition.
3. For Multiple Choice (mcq):
   - Provide exactly 4 plausible, distinct options.
   - The correct_answer MUST match one of the options verbatim.
4. For True/False (true_false):
   - Provide exactly 2 options: ["True", "False"].
   - Make questions nuanced and test key common misconceptions.
5. For Short Answer (short_answer):
   - Ask a question requiring concise conceptual recall.
   - correct_answer must contain the key concept or model explanation.
6. Explanations must be friendly, clear, and explain why the correct answer is right and why distractors are wrong.
7. Output MUST be valid JSON only without markdown or commentary.

REQUIRED JSON STRUCTURE:
{
  "title": "Concise, descriptive title for this quiz",
  "summary": "Brief 1-2 sentence overview of key concepts tested",
  "questions": [
    {
      "id": 1,
      "type": "mcq" | "true_false" | "short_answer",
      "question": "Clear, direct question testing conceptual understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Exact string matching one of the options",
      "explanation": "Detailed explanation of why this answer is correct",
      "difficulty": "${config.difficulty}",
      "key_takeaway": "One-line memorable rule or definition"
    }
  ]
}
`.trim();

  // Prepare Gemini request parts
  const parts: any[] = [];

  if (pdfBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    });
    parts.push({
      text: `${systemPrompt}\n\nSTUDY MATERIAL:\nPlease analyze the attached PDF document to generate the questions.`,
    });
  } else {
    parts.push({
      text: `${systemPrompt}\n\nSTUDY MATERIAL:\n"""\n${textContent.slice(0, 50000)}\n"""`,
    });
  }

  // Model fallback loop
  let lastError: Error | null = null;

  for (const modelName of PRIORITY_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.75, // Ensures creativity and dynamic non-repetitive variety
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`Model ${modelName} returned status ${response.status}:`, data.error?.message);
        continue;
      }

      const rawTextOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawTextOutput) {
        console.warn(`Model ${modelName} returned empty candidates`);
        continue;
      }

      const cleanedJson = rawTextOutput
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Gemini output missing questions array');
      }

      // Validate questions & shuffle MCQ options so correct answers are randomly distributed
      const validatedQuestions: QuizQuestion[] = parsed.questions.map((q: any, idx: number) => {
        let qType: 'mcq' | 'true_false' | 'short_answer' = 'mcq';
        if (config.questionType === 'true_false') qType = 'true_false';
        else if (config.questionType === 'short_answer') qType = 'short_answer';
        else if (config.questionType === 'mixed') {
          qType = q.type && ['mcq', 'true_false', 'short_answer'].includes(q.type) ? q.type : 'mcq';
        }

        let options = Array.isArray(q.options) ? q.options.map(String) : undefined;
        let correctAnswer = String(q.correct_answer || (options ? options[0] : ''));

        if (qType === 'mcq' && options && options.length >= 2) {
          // Shuffle options randomly
          options = [...options].sort(() => Math.random() - 0.5);
        } else if (qType === 'true_false') {
          options = ['True', 'False'];
        }

        return {
          id: idx + 1,
          type: qType,
          question: String(q.question || `Question ${idx + 1}`),
          options,
          correct_answer: correctAnswer,
          explanation: String(q.explanation || 'Review this concept from your study notes.'),
          difficulty: config.difficulty,
          key_takeaway: q.key_takeaway ? String(q.key_takeaway) : undefined,
        };
      });

      const quizId = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const generatedQuiz: GeneratedQuiz = {
        id: quizId,
        title: parsed.title || `${sourceName.replace(/\.[^/.]+$/, '')} Quiz`,
        summary: parsed.summary || `Personalized ${config.difficulty} study quiz with ${validatedQuestions.length} questions.`,
        sourceName,
        sourceType,
        config,
        questions: validatedQuestions,
        createdAt: new Date().toISOString(),
      };

      // Save to Supabase if connected
      if (supabase) {
        try {
          await supabase.from('quizzes').insert({
            title: generatedQuiz.title,
            file_name: sourceName,
            file_type: sourceType,
            raw_text_preview: (textContent || sourceName).slice(0, 500),
            config: config as any,
            questions: validatedQuestions as any,
            user_id: userId || null,
          });
        } catch (dbErr) {
          console.warn('Could not sync quiz to Supabase:', dbErr);
        }
      }

      return generatedQuiz;
    } catch (err: any) {
      console.warn(`Error generating with model ${modelName}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models encountered high demand. Please try again in a moment.');
}
