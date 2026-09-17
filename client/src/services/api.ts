import { GeneratedQuiz, QuizAttempt, QuizConfig, ExtractedDocument } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Local storage keys for resilient persistence
const STORAGE_QUIZZES_KEY = 'stayaheadd_local_quizzes';
const STORAGE_ATTEMPTS_KEY = 'stayaheadd_local_attempts';

export function getLocalQuizzes(): GeneratedQuiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUIZZES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalQuiz(quiz: GeneratedQuiz): void {
  try {
    const current = getLocalQuizzes();
    const filtered = current.filter((q) => q.id !== quiz.id);
    localStorage.setItem(STORAGE_QUIZZES_KEY, JSON.stringify([quiz, ...filtered]));
  } catch (e) {
    console.error('Failed to store quiz locally:', e);
  }
}

export function getLocalAttempts(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalAttempt(attempt: QuizAttempt): void {
  try {
    const current = getLocalAttempts();
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify([attempt, ...current]));
  } catch (e) {
    console.error('Failed to store attempt locally:', e);
  }
}

/**
 * Extract text from document or pasted input
 */
export async function extractText(file?: File, rawText?: string): Promise<ExtractedDocument> {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  } else if (rawText) {
    formData.append('rawText', rawText);
  } else {
    throw new Error('Please select a file or paste study text.');
  }

  const response = await fetch(`${API_BASE}/api/quiz/extract`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || 'Failed to extract text from document');
  }

  return json.data;
}

/**
 * Generate quiz using server-side Gemini 2.0 Flash
 */
export async function generateQuiz(payload: {
  file?: File;
  rawText?: string;
  directText?: string;
  sourceName?: string;
  sourceType?: string;
  config: QuizConfig;
  userId?: string;
}): Promise<GeneratedQuiz> {
  const formData = new FormData();
  if (payload.file) {
    formData.append('file', payload.file);
  }
  if (payload.rawText) {
    formData.append('rawText', payload.rawText);
  }
  if (payload.directText) {
    formData.append('directText', payload.directText);
  }
  if (payload.sourceName) {
    formData.append('sourceName', payload.sourceName);
  }
  if (payload.sourceType) {
    formData.append('sourceType', payload.sourceType);
  }
  if (payload.userId) {
    formData.append('userId', payload.userId);
  }
  formData.append('config', JSON.stringify(payload.config));

  try {
    const response = await fetch(`${API_BASE}/api/quiz/generate`, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || 'Failed to generate quiz');
    }

    const quiz: GeneratedQuiz = json.data;
    saveLocalQuiz(quiz);
    return quiz;
  } catch (err: any) {
    // If backend is unreachable (e.g. standalone frontend preview), generate immediate client-side quiz
    console.warn('Backend API connection failed, generating fallback quiz locally:', err.message);
    const fallbackQuiz = generateClientFallbackQuiz(
      payload.directText || payload.rawText || 'Study Notes Content',
      payload.sourceName || (payload.file ? payload.file.name : 'Pasted Notes'),
      payload.sourceType || 'text',
      payload.config
    );
    saveLocalQuiz(fallbackQuiz);
    return fallbackQuiz;
  }
}

/**
 * Save quiz completion results
 */
export async function recordQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
  saveLocalAttempt(attempt);

  try {
    const response = await fetch(`${API_BASE}/api/quiz/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  } catch (err) {
    console.warn('Could not sync attempt to backend, saved locally');
  }

  return attempt;
}

/**
 * Fetch history
 */
export async function fetchHistory(userId?: string): Promise<{
  quizzes: GeneratedQuiz[];
  attempts: QuizAttempt[];
}> {
  try {
    const url = userId ? `${API_BASE}/api/quiz/history?userId=${encodeURIComponent(userId)}` : `${API_BASE}/api/quiz/history`;
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      const serverQuizzes = json.data.quizzes || [];
      const serverAttempts = json.data.attempts || [];

      // Merge with local storage for instant responsiveness
      const localQ = getLocalQuizzes();
      const localA = getLocalAttempts();

      const combinedQuizzes = [...serverQuizzes];
      for (const l of localQ) {
        if (!combinedQuizzes.find((q) => q.id === l.id)) {
          combinedQuizzes.push(l);
        }
      }

      const combinedAttempts = [...serverAttempts];
      for (const a of localA) {
        if (!combinedAttempts.find((x) => x.id === a.id)) {
          combinedAttempts.push(a);
        }
      }

      return { quizzes: combinedQuizzes, attempts: combinedAttempts };
    }
  } catch (e) {
    // Return local
  }

  return {
    quizzes: getLocalQuizzes(),
    attempts: getLocalAttempts(),
  };
}

/**
 * Instant client-side fallback generator for zero-latency preview
 */
function generateClientFallbackQuiz(
  text: string,
  sourceName: string,
  sourceType: string,
  config: QuizConfig
): GeneratedQuiz {
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.split(' ').length >= 5);

  const cleanTitle = sourceName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const questions = [];
  const count = Math.min(config.numQuestions, Math.max(5, sentences.length));

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length] || `Understanding foundational topics in ${cleanTitle}.`;
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
        type: 'true_false' as const,
        question: isTrue ? sentence : sentence.replace(keyWord, `not ${keyWord}`),
        options: ['True', 'False'],
        correct_answer: isTrue ? 'True' : 'False',
        explanation: `According to your material: "${sentence}". This statement aligns with your notes.`,
        difficulty: config.difficulty,
        key_takeaway: `Rule: ${sentence.slice(0, 90)}...`,
      });
    } else if (qType === 'short_answer') {
      questions.push({
        id: i + 1,
        type: 'short_answer' as const,
        question: `In your study notes, what is the significance of "${keyWord}"?`,
        correct_answer: sentence,
        explanation: `Core excerpt from notes: "${sentence}"`,
        difficulty: config.difficulty,
        key_takeaway: `Key definition: ${sentence.slice(0, 90)}...`,
      });
    } else {
      const correct = sentence;
      const options = [
        correct,
        `It is irrelevant to the discussion of ${keyWord}`,
        `It only applies in hypothetical secondary environments`,
        `None of the provided lecture notes support this premise`,
      ].sort(() => Math.random() - 0.5);

      questions.push({
        id: i + 1,
        type: 'mcq' as const,
        question: `Which of the following points regarding ${keyWord} is supported by your notes?`,
        options,
        correct_answer: correct,
        explanation: `Correct! Your notes state: "${sentence}".`,
        difficulty: config.difficulty,
        key_takeaway: `Key rule: ${sentence.slice(0, 90)}...`,
      });
    }
  }

  return {
    id: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `${cleanTitle} Quiz`,
    summary: `Personalized ${config.difficulty} study quiz containing ${questions.length} questions.`,
    sourceName,
    sourceType,
    config,
    questions,
    createdAt: new Date().toISOString(),
  };
}
