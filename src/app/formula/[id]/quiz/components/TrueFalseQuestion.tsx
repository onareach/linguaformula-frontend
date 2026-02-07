"use client";

import type { AnswerOption } from "./MultipleChoiceQuestion";

export interface TrueFalseQuestionProps {
  stem: string;
  answers: AnswerOption[];
  value: number | null;
  onChange: (answerId: number) => void;
}

export default function TrueFalseQuestion({ stem, answers, value, onChange }: TrueFalseQuestionProps) {
  const sorted = [...answers].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <p style={{ marginBottom: "16px", fontSize: "18px" }}>{stem}</p>
      <p style={{ fontStyle: "italic", color: "#555", marginBottom: "12px" }}>True or False?</p>
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend className="sr-only">Choose True or False</legend>
        {sorted.map((a) => (
          <label key={a.answer_id} style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="tf"
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
