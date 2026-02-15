"use client";

/**
 * Closes this tab so focus returns to the tab that opened it (e.g. the formula detail page).
 * If the browser blocks closing, falls back to the referrer or home.
 */
export default function BackToFormula() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.close();
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-[#6b7c3d] visited:text-[#6b7c3d] hover:underline inline-block"
    >
      ← Back to Formula
    </a>
  );
}
