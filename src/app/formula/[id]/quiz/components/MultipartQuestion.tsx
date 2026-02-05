"use client";

import type { AnswerOption } from "./MultipleChoiceQuestion";
import WordProblemQuestion from "./WordProblemQuestion";

export interface PartItem {
  question_id: number;
  part_label: string;
  stem: string;
  display_order: number;
  answers: AnswerOption[];
}

export interface MultipartQuestionProps {
  stem: string;
  parts: PartItem[];
  value: Record<number, string>;
  onChange: (partQuestionId: number, value: string) => void;
}

export default function MultipartQuestion({ stem, parts, value, onChange }: MultipartQuestionProps) {
  const sortedParts = [...parts].sort((a, b) => a.display_order - b.display_order);
  return (
    <div>
      <p style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 500 }}>{stem}</p>
      {sortedParts.map((part) => (
        <div key={part.question_id} style={{ marginBottom: "24px", marginLeft: "8px" }}>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>Part ({part.part_label})</p>
          <WordProblemQuestion
            stem={part.stem}
            value={value[part.question_id] ?? ""}
            onChange={(v) => onChange(part.question_id, v)}
            inputId={`word-part-${part.question_id}`}
          />
        </div>
      ))}
    </div>
  );
}
