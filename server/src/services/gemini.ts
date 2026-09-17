import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizConfig, QuizQuestion, GeneratedQuiz } from '../types.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Generates structured JSON quiz using Gemini 2.0 Flash
 */
export async function generateQuizWithGemini(
  content: string,
  config: QuizConfig,
  sourceName: string,
  sourceType: string
): Promise<GeneratedQuiz> {
  // If no API key is set, use the intelligent fallback generator
  if (!genAI || !GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️ GEMINI_API_KEY is not set or using placeholder. Running intelligent fallback quiz generator.');
    return generateFallbackQuiz(content, config, sourceName, sourceType);
  }

  // Attempt generation with single-retry logic
  try {
    return await attemptGeminiGeneration(content, config, sourceName, sourceType, false);
  } catch (initialError: any) {
    console.warn('Initial Gemini generation encountered an issue, retrying once...', initialError.message);
    try {
      return await attemptGeminiGeneration(content, config, sourceName, sourceType, true);
    } catch (retryError: any) {
      console.error('Gemini retry failed:', retryError);
      // If quota exceeded or network fails, fall back gracefully to keep user unblocked
      console.warn('Falling back to structured local concept generator.');
      return generateFallbackQuiz(content, config, sourceName, sourceType);
    }
  }
}

async function attemptGeminiGeneration(
  content: string,
  config: QuizConfig,
  sourceName: string,
  sourceType: string,
  isRetry: boolean
): Promise<GeneratedQuiz> {
  const model = genAI!.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: isRetry ? 0.3 : 0.4,
    },
  });

  const prompt = `
You are StayAheadd's master educator AI. Your task is to analyze the student's study material and generate an engaging, highly accurate quiz.

QUIZ SPECIFICATIONS:
- Number of questions: ${config.numQuestions}
- Question format: ${config.questionType.toUpperCase()} (Options: 'mcq', 'true_false', 'short_answer', or 'mixed')
- Target difficulty: ${config.difficulty.toUpperCase()}
- Document name: "${sourceName}"

STUDY MATERIAL:
\"\"\"
${content.slice(0, 45000)}
\"\"\"

STRICT OUTPUT JSON FORMAT:
You MUST respond with a valid, parseable JSON object matching this schema exactly without markdown fences or extra text:
{
  "title": "Concise, descriptive title for this quiz",
  "summary": "Brief 1-2 sentence overview of key topics tested",
  "questions": [
    {
      "id": 1,
      "type": "mcq" | "true_false" | "short_answer",
      "question": "Clear, direct question testing conceptual understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Required for mcq (4 options) and true_false (2 options: ["True", "False"])
      "correct_answer": "Exact string matching one of the options (or model answer for short_answer)",
      "explanation": "Clear, encouraging explanation of why this answer is correct and why other key misconceptions are wrong.",
      "difficulty": "${config.difficulty}",
      "key_takeaway": "One-line memorable rule or definition"
    }
  ]
}

RULES:
1. Every question must be grounded solely in the provided study material.
2. For 'mcq', provide exactly 4 distinct, plausible options. Make sure correct_answer matches one of the options verbatim.
3. For 'true_false', provide exactly 2 options: ["True", "False"].
4. Explanations must be educational, constructive, and friendly.
5. All text must be in sentence case (no all-caps questions or options).
`.trim();

  const response = await model.generateContent(prompt);
  const textResponse = response.response.text();

  let parsed: any;
  try {
    // Strip accidental code block backticks if any
    const cleanedJson = textResponse.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    parsed = JSON.parse(cleanedJson);
  } catch (err: any) {
    throw new Error(`Invalid JSON returned by Gemini: ${err.message}`);
  }

  if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('Gemini output missing questions array');
  }

  // Sanitize and validate questions
  const validatedQuestions: QuizQuestion[] = parsed.questions.map((q: any, idx: number) => {
    let qType: 'mcq' | 'true_false' | 'short_answer' = 'mcq';
    if (config.questionType === 'true_false') qType = 'true_false';
    else if (config.questionType === 'short_answer') qType = 'short_answer';
    else if (config.questionType === 'mixed') {
      qType = q.type && ['mcq', 'true_false', 'short_answer'].includes(q.type) ? q.type : 'mcq';
    }

    let options = Array.isArray(q.options) ? q.options.map(String) : undefined;
    if (qType === 'true_false' && (!options || options.length !== 2)) {
      options = ['True', 'False'];
    }

    return {
      id: idx + 1,
      type: qType,
      question: String(q.question || `Question ${idx + 1}`),
      options,
      correct_answer: String(q.correct_answer || (options ? options[0] : '')),
      explanation: String(q.explanation || 'Review this concept from your study notes.'),
      difficulty: config.difficulty,
      key_takeaway: q.key_takeaway ? String(q.key_takeaway) : undefined,
    };
  });

  return {
    title: parsed.title || `${sourceName.replace(/\.[^/.]+$/, '')} Quiz`,
    summary: parsed.summary || `Personalized quiz generated from ${sourceName}.`,
    sourceName,
    sourceType,
    config,
    questions: validatedQuestions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Intelligent fallback generator that builds structured quiz questions directly
 * from key sentences and concepts when running without API keys or during offline tests.
 */
function generateFallbackQuiz(
  content: string,
  config: QuizConfig,
  sourceName: string,
  sourceType: string
): GeneratedQuiz {
  // Extract sentences with substance
  const sentences = content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !s.includes('\n') && s.split(' ').length >= 6);

  const cleanTitle = sourceName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const questions: QuizQuestion[] = [];
  const targetCount = Math.min(config.numQuestions, Math.max(5, sentences.length));

  for (let i = 0; i < targetCount; i++) {
    const sentence = sentences[i % sentences.length] || `Understanding key concepts in ${cleanTitle}.`;
    const words = sentence.split(' ').filter((w) => w.length > 3);
    const keyWord = words[Math.floor(words.length / 2)]?.replace(/[,\.()]/g, '') || 'concept';

    let qType: 'mcq' | 'true_false' | 'short_answer' = 'mcq';
    if (config.questionType === 'true_false') qType = 'true_false';
    else if (config.questionType === 'short_answer') qType = 'short_answer';
    else if (config.questionType === 'mixed') {
      const types: ('mcq' | 'true_false' | 'short_answer')[] = ['mcq', 'true_false', 'short_answer'];
      qType = types[i % types.length];
    }

    if (qType === 'true_false') {
      const isTrue = i % 2 === 0;
      questions.push({
        id: i + 1,
        type: 'true_false',
        question: isTrue ? sentence : sentence.replace(keyWord, `not necessarily ${keyWord}`),
        options: ['True', 'False'],
        correct_answer: isTrue ? 'True' : 'False',
        explanation: `Based on your material: "${sentence}". This statement accurately reflects the study notes.`,
        difficulty: config.difficulty,
        key_takeaway: `Remember: ${sentence}`,
      });
    } else if (qType === 'short_answer') {
      questions.push({
        id: i + 1,
        type: 'short_answer',
        question: `Based on your study notes, describe the role of ${keyWord} in this context: "${sentence.slice(0, 100)}..."?`,
        correct_answer: sentence,
        explanation: `Key concept directly from your material: "${sentence}"`,
        difficulty: config.difficulty,
        key_takeaway: `Key takeaway: ${keyWord} is central to ${cleanTitle}.`,
      });
    } else {
      // MCQ
      const options = [
        sentence,
        `It is unrelated to ${keyWord} in these lecture notes`,
        `It applies only during secondary preliminary phases`,
        `None of the above statements are supported by the notes`,
      ];
      // Randomize option order
      const correct = options[0];
      const shuffled = [...options].sort(() => Math.random() - 0.5);

      questions.push({
        id: i + 1,
        type: 'mcq',
        question: `According to your material, which statement regarding ${keyWord} is accurate?`,
        options: shuffled,
        correct_answer: correct,
        explanation: `Correct! Your notes state: "${sentence}". The other choices do not reflect the uploaded material.`,
        difficulty: config.difficulty,
        key_takeaway: `Core definition: ${sentence.slice(0, 90)}...`,
      });
    }
  }

  return {
    title: `${cleanTitle} Quiz`,
    summary: `Personalized ${config.difficulty} quiz containing ${questions.length} questions derived from your study material.`,
    sourceName,
    sourceType,
    config,
    questions,
    createdAt: new Date().toISOString(),
  };
}
