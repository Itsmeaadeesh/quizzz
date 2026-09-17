import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { quizRouter } from './routes/quiz.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'StayAheadd API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')),
    timestamp: new Date().toISOString(),
  });
});

// Mount Quiz API routes
app.use('/api/quiz', quizRouter);

// Specific Multer Error Interceptor with Brand-Voice Message
app.use((err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'Whoa, that file is over 10MB! Please upload a file under 10MB or paste your notes directly.',
      });
      return;
    }
    res.status(400).json({ error: `File upload error: ${err.message}` });
    return;
  }
  if (err) {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    return;
  }
  next();
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 StayAheadd backend running on http://localhost:${PORT}`);
  console.log(`📚 Health check available at http://localhost:${PORT}/api/health`);
});
