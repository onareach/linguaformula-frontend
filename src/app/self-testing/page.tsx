'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/authClient';
import MultipleChoiceQuestion from '@/app/formula/[id]/quiz/components/MultipleChoiceQuestion';
import TrueFalseQuestion from '@/app/formula/[id]/quiz/components/TrueFalseQuestion';
import WordProblemQuestion from '@/app/formula/[id]/quiz/components/WordProblemQuestion';
import MultipartQuestion from '@/app/formula/[id]/quiz/components/MultipartQuestion';

type Course = {
  course_id: number;
  course_name: string;
  course_code: string | null;
};

type QuizQuestion = {
  question_id: number;
  question_type: 'multiple_choice' | 'true_false' | 'word_problem' | 'multipart';
  stem: string;
  explanation: string | null;
  display_order: number;
  formula_id?: number;
  answers: { answer_id: number; answer_text: string; answer_numeric: number | null; is_correct: boolean; display_order: number }[];
  parts?: { question_id: number; part_label: string; stem: string; display_order: number; answers: { answer_id: number; answer_text: string; answer_numeric: number | null; is_correct: boolean; display_order: number }[] }[];
};

const SEGMENT_TYPES = ['chapter', 'module', 'examination'] as const;

export default function SelfTestingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [segmentType, setSegmentType] = useState<string>('');
  const [segmentLabel, setSegmentLabel] = useState('');
  const [segmentLabels, setSegmentLabels] = useState<string[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [wordAnswer, setWordAnswer] = useState('');
  const [multipartAnswers, setMultipartAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [courseName, setCourseName] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setCoursesLoading(true);
    authFetch('/api/courses')
      .then((res) => res.json())
      .then((data: { courses?: Course[]; error?: string }) => {
        if (data.courses) setCourses(data.courses);
        else setCourses([]);
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || selectedCourseId == null) return;
    authFetch(`/api/courses/${selectedCourseId}/formulas`)
      .then((res) => res.json())
      .then((data: { formulas?: { segment_label?: string | null }[] }) => {
        const labels = new Set<string>();
        (data.formulas || []).forEach((f) => {
          const L = (f.segment_label ?? '').trim();
          if (L) labels.add(L);
        });
        setSegmentLabels(Array.from(labels).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
      })
      .catch(() => setSegmentLabels([]));
  }, [user, selectedCourseId]);

  useEffect(() => {
    setSelectedAnswerId(null);
    setWordAnswer('');
    setMultipartAnswers({});
    setSubmitted(false);
    setFeedback(null);
  }, [currentIndex]);

  function startQuiz() {
    if (selectedCourseId == null) return;
    setError(null);
    setHasAttemptedFetch(true);
    setQuestionsLoading(true);
    const params = new URLSearchParams();
    if (segmentType && ['chapter', 'module', 'examination'].includes(segmentType)) {
      params.set('segment_type', segmentType);
    }
    if (segmentLabel.trim()) {
      params.set('segment_label', segmentLabel.trim());
    }
    const qs = params.toString();
    authFetch(`/api/courses/${selectedCourseId}/questions${qs ? `?${qs}` : ''}`)
      .then((res) => res.json())
      .then((data: { questions?: QuizQuestion[]; course_name?: string; course_code?: string; error?: string }) => {
        if (data.error) {
          setError(data.error);
          setQuestions([]);
          return;
        }
        setQuestions(data.questions || []);
        setCourseName(data.course_name || '');
        setCourseCode(data.course_code || null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setQuestions([]);
      })
      .finally(() => setQuestionsLoading(false));
  }

  function resetQuiz() {
    setQuestions([]);
    setCurrentIndex(0);
    setCourseName('');
    setCourseCode(null);
    setError(null);
    setHasAttemptedFetch(false);
  }

  const current = questions[currentIndex];
  const hasNext = currentIndex < questions.length - 1;

  const checkAnswer = (): { correct: boolean; message: string } => {
    if (!current) return { correct: false, message: 'No question.' };
    if (current.question_type === 'multiple_choice' || current.question_type === 'true_false') {
      const selected = current.answers.find((a) => a.answer_id === selectedAnswerId);
      if (selected == null) return { correct: false, message: 'Please select an answer.' };
      const correctAnswer = current.answers.find((a) => a.is_correct);
      return {
        correct: selected.is_correct,
        message: selected.is_correct ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer?.answer_text ?? '—'}.`,
      };
    }
    if (current.question_type === 'word_problem') {
      const trimmed = wordAnswer.trim();
      if (!trimmed) return { correct: false, message: 'Please enter an answer.' };
      const correctAnswer = current.answers.find((a) => a.is_correct);
      if (!correctAnswer) return { correct: false, message: 'No correct answer defined.' };
      const num = parseFloat(trimmed);
      const correct =
        correctAnswer.answer_numeric != null
          ? !Number.isNaN(num) && Math.abs(num - correctAnswer.answer_numeric) < 0.01
          : trimmed.toLowerCase() === (correctAnswer.answer_text ?? '').toLowerCase();
      return {
        correct,
        message: correct ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer.answer_text}.`,
      };
    }
    if (current.question_type === 'multipart' && current.parts) {
      let allCorrect = true;
      const messages: string[] = [];
      for (const part of current.parts) {
        const partVal = (multipartAnswers[part.question_id] ?? '').trim();
        const correctAnswer = part.answers.find((a) => a.is_correct);
        if (!correctAnswer) continue;
        const num = parseFloat(partVal);
        const correct =
          correctAnswer.answer_numeric != null
            ? !Number.isNaN(num) && Math.abs(num - correctAnswer.answer_numeric) < 0.01
            : partVal.toLowerCase() === (correctAnswer.answer_text ?? '').toLowerCase();
        if (!correct) {
          allCorrect = false;
          messages.push(`Part (${part.part_label}): correct answer is ${correctAnswer.answer_text}.`);
        }
      }
      return {
        correct: allCorrect,
        message: allCorrect ? 'Correct!' : `Incorrect. ${messages.join(' ')}`,
      };
    }
    return { correct: false, message: 'Unknown question type.' };
  };

  const handleSubmit = () => {
    const result = checkAnswer();
    setFeedback(result);
    setSubmitted(true);
  };

  const renderQuestion = () => {
    if (!current) return null;
    switch (current.question_type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            stem={current.stem}
            answers={current.answers}
            value={selectedAnswerId}
            onChange={setSelectedAnswerId}
          />
        );
      case 'true_false':
        return (
          <TrueFalseQuestion
            stem={current.stem}
            answers={current.answers}
            value={selectedAnswerId}
            onChange={setSelectedAnswerId}
          />
        );
      case 'word_problem':
        return <WordProblemQuestion stem={current.stem} value={wordAnswer} onChange={setWordAnswer} inputId={`self-test-word-${current.question_id}`} />;
      case 'multipart':
        return current.parts ? (
          <MultipartQuestion
            stem={current.stem}
            parts={current.parts}
            value={multipartAnswers}
            onChange={(partId, value) => setMultipartAnswers((prev) => ({ ...prev, [partId]: value }))}
          />
        ) : (
          <p>Invalid multipart question.</p>
        );
      default:
        return <p>Unknown question type.</p>;
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  if (!user) return null;

  const buttonStyle =
    'px-4 py-2 rounded-md font-medium text-white bg-[#6b7c3d] hover:bg-[#7a8f4a] disabled:opacity-50 cursor-pointer';

  if (questions.length > 0 && current) {
    return (
      <div className="p-4 max-w-2xl">
        <button
          type="button"
          onClick={resetQuiz}
          className="text-[#6b7c3d] hover:underline mb-4 block"
        >
          ← Back to course selection
        </button>
        <h1 className="text-2xl font-bold mb-2">Self-testing</h1>
        <p className="text-gray-600 dark:text-zinc-400 mb-4">
          {courseCode ? `${courseCode}: ` : ''}{courseName} — Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          {renderQuestion()}
        </div>
        {!submitted ? (
          <button type="button" onClick={handleSubmit} className={buttonStyle}>
            Submit
          </button>
        ) : (
          <>
            <p
              className={`mb-4 p-3 rounded-md font-medium ${
                feedback?.correct ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              {feedback?.message}
            </p>
            <div className="flex gap-3 flex-wrap">
              {hasNext ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className={buttonStyle}
                >
                  Next question
                </button>
              ) : (
                <button type="button" onClick={resetQuiz} className={buttonStyle}>
                  Finish — choose another course
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">self-testing</h1>
      <p className="text-gray-600 dark:text-zinc-400 mb-6">
        Test yourself on all formulas linked to a course. Choose a course and optionally filter by segment.
      </p>
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
      {coursesLoading ? (
        <p>Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-600 dark:text-zinc-400">
          No courses yet. <Link href="/courses" className="text-[#6b7c3d] hover:underline">Add courses</Link> and link formulas to them first.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="course-select" className="block text-sm font-medium mb-1">
              Course
            </label>
            <select
              id="course-select"
              value={selectedCourseId ?? ''}
              onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
            >
              <option value="">— Select a course —</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name}
                  {c.course_code ? ` (${c.course_code})` : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedCourseId != null && (
            <>
              <div>
                <label htmlFor="segment-type" className="block text-sm font-medium mb-1">
                  Segment type (optional)
                </label>
                <select
                  id="segment-type"
                  value={segmentType}
                  onChange={(e) => setSegmentType(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                >
                  <option value="">All segments</option>
                  {SEGMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {segmentLabels.length > 0 && (
                <div>
                  <label htmlFor="segment-label" className="block text-sm font-medium mb-1">
                    Segment label (optional)
                  </label>
                  <select
                    id="segment-label"
                    value={segmentLabel}
                    onChange={(e) => setSegmentLabel(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200"
                  >
                    <option value="">All labels</option>
                    {segmentLabels.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <button
            type="button"
            onClick={startQuiz}
            disabled={selectedCourseId == null || questionsLoading}
            className={buttonStyle}
          >
            {questionsLoading ? 'Loading questions…' : 'Start quiz'}
          </button>
          {questionsLoading && <p className="text-sm text-gray-500">Fetching questions…</p>}
          {hasAttemptedFetch && !questionsLoading && questions.length === 0 && selectedCourseId != null && !error && (
            <p className="text-gray-600 dark:text-zinc-400">
              No questions found for this course{segmentType || segmentLabel ? ' and segment' : ''}. Add formulas to your course and ensure they have quiz questions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
