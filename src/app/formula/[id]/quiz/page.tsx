"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MultipleChoiceQuestion from "./components/MultipleChoiceQuestion";
import TrueFalseQuestion from "./components/TrueFalseQuestion";
import WordProblemQuestion from "./components/WordProblemQuestion";
import MultipartQuestion from "./components/MultipartQuestion";

interface AnswerOption {
  answer_id: number;
  answer_text: string;
  answer_numeric: number | null;
  is_correct: boolean;
  display_order: number;
}

interface PartItem {
  question_id: number;
  part_label: string;
  stem: string;
  display_order: number;
  answers: AnswerOption[];
}

interface QuizQuestion {
  question_id: number;
  question_type: "multiple_choice" | "true_false" | "word_problem" | "multipart";
  stem: string;
  explanation: string | null;
  display_order: number;
  answers: AnswerOption[];
  parts?: PartItem[];
}

function QuizContent() {
  const params = useParams();
  const id = params.id as string;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [wordAnswer, setWordAnswer] = useState("");
  const [multipartAnswers, setMultipartAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!id || !process.env.NEXT_PUBLIC_API_URL) {
      setError("Missing formula ID or API URL.");
      setLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/formulas/${id}/questions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load questions");
        return res.json();
      })
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Reset answer state and feedback when switching questions
  useEffect(() => {
    setSelectedAnswerId(null);
    setWordAnswer("");
    setMultipartAnswers({});
    setSubmitted(false);
    setFeedback(null);
  }, [currentIndex]);

  if (loading) return <p>Loading quiz...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (questions.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <p>No questions for this formula yet.</p>
        <Link
          href={`/formula/${id}`}
          className="link-olive"
        >
          ← Back to Formula
        </Link>
      </div>
    );
  }

  const current = questions[currentIndex];
  const hasNext = currentIndex < questions.length - 1;

  const checkAnswer = (): { correct: boolean; message: string } => {
    if (current.question_type === "multiple_choice" || current.question_type === "true_false") {
      const selected = current.answers.find((a) => a.answer_id === selectedAnswerId);
      if (selected == null) return { correct: false, message: "Please select an answer." };
      const correctAnswer = current.answers.find((a) => a.is_correct);
      const correct = selected.is_correct;
      return {
        correct,
        message: correct ? "Correct!" : `Incorrect. The correct answer is: ${correctAnswer?.answer_text ?? "—"}.`,
      };
    }
    if (current.question_type === "word_problem") {
      const trimmed = wordAnswer.trim();
      if (!trimmed) return { correct: false, message: "Please enter an answer." };
      const correctAnswer = current.answers.find((a) => a.is_correct);
      if (!correctAnswer) return { correct: false, message: "No correct answer defined." };
      const num = parseFloat(trimmed);
      const correct =
        correctAnswer.answer_numeric != null
          ? !Number.isNaN(num) && Math.abs(num - correctAnswer.answer_numeric) < 0.01
          : trimmed.toLowerCase() === (correctAnswer.answer_text ?? "").toLowerCase();
      return {
        correct,
        message: correct ? "Correct!" : `Incorrect. The correct answer is: ${correctAnswer.answer_text}.`,
      };
    }
    if (current.question_type === "multipart" && current.parts) {
      let allCorrect = true;
      const messages: string[] = [];
      for (const part of current.parts) {
        const partVal = (multipartAnswers[part.question_id] ?? "").trim();
        const correctAnswer = part.answers.find((a) => a.is_correct);
        if (!correctAnswer) continue;
        const num = parseFloat(partVal);
        const correct =
          correctAnswer.answer_numeric != null
            ? !Number.isNaN(num) && Math.abs(num - correctAnswer.answer_numeric) < 0.01
            : partVal.toLowerCase() === (correctAnswer.answer_text ?? "").toLowerCase();
        if (!correct) {
          allCorrect = false;
          messages.push(`Part (${part.part_label}): correct answer is ${correctAnswer.answer_text}.`);
        }
      }
      return {
        correct: allCorrect,
        message: allCorrect ? "Correct!" : `Incorrect. ${messages.join(" ")}`,
      };
    }
    return { correct: false, message: "Unknown question type." };
  };

  const handleSubmit = () => {
    const result = checkAnswer();
    setFeedback(result);
    setSubmitted(true);
  };

  const renderQuestion = () => {
    switch (current.question_type) {
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            stem={current.stem}
            answers={current.answers}
            value={selectedAnswerId}
            onChange={setSelectedAnswerId}
          />
        );
      case "true_false":
        return (
          <TrueFalseQuestion
            stem={current.stem}
            answers={current.answers}
            value={selectedAnswerId}
            onChange={setSelectedAnswerId}
          />
        );
      case "word_problem":
        return <WordProblemQuestion stem={current.stem} value={wordAnswer} onChange={setWordAnswer} />;
      case "multipart":
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

  const buttonStyle = {
    padding: "8px 16px",
    background: "#6b7c3d",
    color: "white" as const,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer" as const,
    fontWeight: 500,
  };

  return (
    <div style={{ padding: "20px", maxWidth: "720px" }}>
      <Link
        href={`/formula/${id}`}
        className="link-olive mb-4 inline-block"
      >
        ← Back to Formula
      </Link>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>Quiz</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Question {currentIndex + 1} of {questions.length}
      </p>
      <div style={{ marginBottom: "24px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
        {renderQuestion()}
      </div>
      {!submitted ? (
        <button type="button" onClick={handleSubmit} style={buttonStyle}>
          Submit
        </button>
      ) : (
        <>
          <p
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "6px",
              fontWeight: 500,
              background: feedback?.correct ? "#dcfce7" : "#fee2e2",
              color: feedback?.correct ? "#166534" : "#991b1b",
            }}
          >
            {feedback?.message}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {hasNext ? (
              <button type="button" onClick={() => setCurrentIndex((i) => i + 1)} style={buttonStyle}>
                Next question
              </button>
            ) : (
              <Link href={`/formula/${id}`} style={{ ...buttonStyle, textDecoration: "none", display: "inline-block" }}>
                Back to Formula
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <QuizContent />
    </Suspense>
  );
}
