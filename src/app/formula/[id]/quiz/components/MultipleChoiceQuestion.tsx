"use client";

export interface AnswerOption {
  answer_id: number;
  answer_text: string;
  answer_numeric: number | null;
  is_correct: boolean;
  display_order: number;
}

export interface MultipleChoiceQuestionProps {
  stem: string;
  answers: AnswerOption[];
  value: number | null;
  onChange: (answerId: number) => void;
}

export default function MultipleChoiceQuestion({ stem, answers, value, onChange }: MultipleChoiceQuestionProps) {
  const sorted = [...answers].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <p style={{ marginBottom: "16px", fontSize: "18px" }}>{stem}</p>
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend className="sr-only">Choose one answer</legend>
        {sorted.map((a) => (
          <label key={a.answer_id} style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="mc"
              value={String(a.answer_id)}
              checked={value === a.answer_id}
              onChange={() => onChange(a.answer_id)}
              style={{ marginRight: "8px", accentColor: "#6b7c3d" }}
            />
            {a.answer_text}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
