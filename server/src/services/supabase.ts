import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GeneratedQuiz, QuizAttempt } from '../types.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')
) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('✅ Supabase connected successfully.');
} else {
  console.log('ℹ️ Running Supabase service in local storage fallback mode.');
}

// In-memory fallback stores for local testing without database keys
const localQuizzes: GeneratedQuiz[] = [];
const localAttempts: QuizAttempt[] = [];

export async function saveQuiz(quiz: GeneratedQuiz, userId?: string): Promise<GeneratedQuiz> {
  const quizId = quiz.id || `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullQuiz: GeneratedQuiz = { ...quiz, id: quizId };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          id: quizId,
          user_id: userId || null,
          title: quiz.title,
          file_name: quiz.sourceName,
          file_type: quiz.sourceType,
          raw_text_preview: quiz.summary,
          config: quiz.config,
          questions: quiz.questions,
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert error, saving locally:', error.message);
        localQuizzes.unshift(fullQuiz);
      }
    } catch (err: any) {
      console.warn('Supabase request failed, saving locally:', err.message);
      localQuizzes.unshift(fullQuiz);
    }
  } else {
    localQuizzes.unshift(fullQuiz);
  }

  return fullQuiz;
}

export async function saveQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
  const attemptId = attempt.id || `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const fullAttempt: QuizAttempt = { ...attempt, id: attemptId };

  if (supabase) {
    try {
      const { error } = await supabase.from('quiz_attempts').insert({
        id: attemptId,
        quiz_id: attempt.quizId,
        user_id: attempt.userId || null,
        score: attempt.score,
        total_questions: attempt.totalQuestions,
        percentage: attempt.percentage,
        user_answers: attempt.userAnswers,
        time_taken_seconds: attempt.timeTakenSeconds,
        completed_at: attempt.completedAt,
      });

      if (error) {
        console.warn('Supabase attempt insert error:', error.message);
        localAttempts.unshift(fullAttempt);
      }
    } catch (err: any) {
      console.warn('Supabase attempt failed:', err.message);
      localAttempts.unshift(fullAttempt);
    }
  } else {
    localAttempts.unshift(fullAttempt);
  }

  return fullAttempt;
}

export async function getQuizzes(userId?: string): Promise<GeneratedQuiz[]> {
  if (supabase) {
    try {
      let query = supabase.from('quizzes').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          summary: row.raw_text_preview,
          sourceName: row.file_name,
          sourceType: row.file_type,
          config: row.config,
          questions: row.questions,
          createdAt: row.created_at,
        }));
      }
    } catch (err: any) {
      console.warn('Supabase getQuizzes failed:', err.message);
    }
  }
  return localQuizzes;
}

export async function getQuizAttempts(userId?: string): Promise<QuizAttempt[]> {
  if (supabase) {
    try {
      let query = supabase.from('quiz_attempts').select('*').order('completed_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          quizId: row.quiz_id,
          userId: row.user_id,
          score: row.score,
          totalQuestions: row.total_questions,
          percentage: Number(row.percentage),
          userAnswers: row.user_answers,
          timeTakenSeconds: row.time_taken_seconds,
          completedAt: row.completed_at,
        }));
      }
    } catch (err: any) {
      console.warn('Supabase getQuizAttempts failed:', err.message);
    }
  }
  return localAttempts;
}
