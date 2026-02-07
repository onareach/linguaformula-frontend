"use client";

export interface WordProblemQuestionProps {
  stem: string;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
}

export default function WordProblemQuestion({ stem, value, onChange, inputId = "word-answer" }: WordProblemQuestionProps) {
  return (
    <div>
      <p style={{ marginBottom: "16px", fontSize: "18px" }}>{stem}</p>
      <label htmlFor={inputId} style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
        Your answer:
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        placeholder="Enter a number or value"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        style={{ padding: "8px 12px", fontSize: "16px", maxWidth: "300px", width: "100%", background: "white", border: "1px solid #ccc" }}
      />
    </div>
  );
}
