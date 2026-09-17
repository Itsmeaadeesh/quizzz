import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { extractTextFromFile, extractFromRawText } from '../services/extractor.js';
import { generateQuizWithGemini } from '../services/gemini.js';
import { saveQuiz, saveQuizAttempt, getQuizzes, getQuizAttempts } from '../services/supabase.js';
import { QuizConfig } from '../types.js';

export const quizRouter = Router();

// Rate limiter: Max 20 quiz generations per 15 minutes per IP
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You've generated quite a few quizzes in a short window! Please take a quick 15-minute study break before generating more.",
  },
});

// Configure Multer for memory storage with 10MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt', '.md'];
    const originalName = file.originalname.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => originalName.endsWith(ext));
    if (isAllowed || file.mimetype.includes('pdf') || file.mimetype.includes('officedocument') || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `We couldn't recognize that file type. StayAheadd supports PDF, PPTX, DOCX, or plain text files!`
        )
      );
    }
  },
});

/**
 * Extract text preview route
 * POST /api/quiz/extract
 */
quizRouter.post('/extract', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const rawText = req.body.rawText;
    const file = req.file;

    if (file) {
      const result = await extractTextFromFile(file.buffer, file.originalname, file.mimetype);
      res.json({
        success: true,
        data: {
          sourceName: file.originalname,
          sourceType: result.sourceType,
          wordCount: result.wordCount,
          preview: result.preview,
          fullText: result.text,
        },
      });
      return;
    } else if (rawText && typeof rawText === 'string') {
      const result = extractFromRawText(rawText);
      res.json({
        success: true,
        data: {
          sourceName: 'Pasted Study Notes',
          sourceType: 'text',
          wordCount: result.wordCount,
          preview: result.preview,
          fullText: result.text,
        },
      });
      return;
    } else {
      res.status(400).json({
        error: 'Please upload a study document (PDF, DOCX, PPTX) or paste your notes to get started.',
      });
      return;
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error processing document' });
  }
});

/**
 * Generate quiz route
 * POST /api/quiz/generate
 */
quizRouter.post('/generate', generateLimiter, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const rawText = req.body.rawText;
    const directText = req.body.directText; // If text was already extracted previously
    const rawConfig = req.body.config;

    let config: QuizConfig = {
      questionType: 'mcq',
      numQuestions: 10,
      difficulty: 'medium',
    };

    if (rawConfig) {
      try {
        const parsedConfig = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
        config = {
          questionType: ['mcq', 'true_false', 'short_answer', 'mixed'].includes(parsedConfig.questionType)
            ? parsedConfig.questionType
            : 'mcq',
          numQuestions: Math.max(5, Math.min(50, Number(parsedConfig.numQuestions) || 10)),
          difficulty: ['easy', 'medium', 'hard'].includes(parsedConfig.difficulty)
            ? parsedConfig.difficulty
            : 'medium',
        };
      } catch (e) {
        // Use defaults
      }
    }

    let content = '';
    let sourceName = 'Study Notes';
    let sourceType = 'text';

    if (directText && typeof directText === 'string') {
      content = directText;
      sourceName = req.body.sourceName || 'Study Notes';
      sourceType = req.body.sourceType || 'text';
    } else if (file) {
      const extracted = await extractTextFromFile(file.buffer, file.originalname, file.mimetype);
      content = extracted.text;
      sourceName = file.originalname;
      sourceType = extracted.sourceType;
    } else if (rawText && typeof rawText === 'string') {
      const extracted = extractFromRawText(rawText);
      content = extracted.text;
      sourceName = 'Pasted Notes';
      sourceType = 'text';
    } else {
      res.status(400).json({
        error: 'Please upload a study document or paste your notes so StayAheadd can generate your quiz.',
      });
      return;
    }

    // Generate questions with Gemini 2.0 Flash
    const quiz = await generateQuizWithGemini(content, config, sourceName, sourceType);

    // Persist to Supabase / store
    const userId = req.body.userId;
    const savedQuiz = await saveQuiz(quiz, userId);

    res.json({
      success: true,
      data: savedQuiz,
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: error.message || 'Something went wrong while generating your quiz. Please try again.',
    });
  }
});

/**
 * Save quiz attempt / results
 * POST /api/quiz/attempt
 */
quizRouter.post('/attempt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId, userId, score, totalQuestions, percentage, userAnswers, timeTakenSeconds } = req.body;

    if (!quizId) {
      res.status(400).json({ error: 'Quiz ID is required.' });
      return;
    }

    const savedAttempt = await saveQuizAttempt({
      quizId,
      userId,
      score: Number(score) || 0,
      totalQuestions: Number(totalQuestions) || 0,
      percentage: Number(percentage) || 0,
      userAnswers: Array.isArray(userAnswers) ? userAnswers : [],
      timeTakenSeconds: Number(timeTakenSeconds) || 0,
      completedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: savedAttempt });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error saving attempt' });
  }
});

/**
 * Fetch quizzes for dashboard
 * GET /api/quiz/history
 */
quizRouter.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string | undefined;
    const quizzes = await getQuizzes(userId);
    const attempts = await getQuizAttempts(userId);

    res.json({
      success: true,
      data: {
        quizzes,
        attempts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error retrieving quiz history' });
  }
});
