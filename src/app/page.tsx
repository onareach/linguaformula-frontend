// page.tsx

'use client';

import { MathJaxContext } from 'better-react-mathjax';
import ClientMathJax from '@/components/ClientMathJax';

export default function Home() {
  return (
    <MathJaxContext>
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-6">Welcome to Lingua Formula</h1>

        <p className="mb-4">
          Here, we speak <em>Formula</em>—a specialized, cross-lingual mode of expression.
        </p>

        <p className="mb-4">
          Formulas express ideas using a highly refined language. They are <em>cross-lingual</em> in the sense that the same symbols and grammatical structures are recognizable across many natural languages without alteration. While a formula may be spoken or read differently in English, Spanish, Russian, or Cantonese, its symbolic structure—and the ideas it expresses—remain unchanged.
        </p>

        <p className="mb-4">
          If <em>Formula</em> were treated as a language in its own right, it would be best understood as a subset of natural languages. Yet to use this language effectively, one must recognize something subtle but essential: the symbols it employs—and even the familiar words associated with those symbols—carry meanings that are more precise, constrained, and context-dependent than the same words used elsewhere. Outside their formal setting, meanings blur; within <em>Formula</em>, they are deliberately sharpened.
        </p>

        <p className="mb-4">
          A simple example is the equals sign, <strong>=</strong>, and the word <em>equal</em>. In everyday English, <em>equal</em> is elastic: it can mean <em>approximately the same</em>, <em>morally equivalent</em>, <em>fair</em>, or <em>balanced</em>. In <em>Formula</em>, however, <strong>=</strong> has a sharply defined meaning. It asserts strict identity within a specified system of rules—no approximation, no metaphor, no appeal to intent or context. The symbol does not <em>suggest</em> sameness; it <em>declares</em> it.
        </p>

        <p className="mb-4">
          This points to one of the distinctive features of <em>Formula</em> as a language: many natural-language words are paired with <strong>single symbols</strong> that act as compressed carriers of meaning. Words such as <em>sum</em>, <em>integral</em>, <em>limit</em>, or <em>function</em> each have symbolic equivalents—∑, ∫, lim, <em>f</em>(<em>x</em>). These are not mere shorthand. They are semantic refinements: compact forms designed to preserve structure while eliminating ambiguity.
        </p>

        <p className="mb-4">
          Another distinct feature of <em>Formula</em> is how it <strong>invites substitution</strong>. Consider the formula
        </p>

        <div className="my-6 text-center">
          <ClientMathJax>{`\\[F = ma\\]`}</ClientMathJax>
        </div>

        <p className="mb-4">
          This expression does more than state a general relationship among force, mass, and acceleration. It invites the reader to <em>insert values</em> into each part of the sentence. In doing so, the symbols must be defined not only conceptually, but also quantitatively.
        </p>

        <p className="mb-4">
          That requirement brings units into the language. If mass is assigned a value of 10 kilograms, then acceleration and force must be expressed in compatible units, or the sentence becomes meaningless—or false. In <em>Formula</em>, correctness depends not only on structure, but on the coherence of the entire system of meanings, values, and units. The language enforces this consistency automatically.
        </p>

        <p className="mb-4">
          In this way, formulas resemble <strong>recipes</strong>. A recipe does not merely describe an idea like &quot;bread&quot;; it specifies ingredients, quantities, and procedures. Substituting sugar for salt or doubling the flour without adjusting the liquid does not produce a slightly poetic result—it produces failure. Recipes, like formulas, are unforgiving not because they are rigid, but because they encode relationships that must remain in balance.
        </p>

        <p className="mb-4">
          Formulas also resemble <strong>computer programming languages</strong>. A line of code is a sentence written in a language that allows little ambiguity. Variables must be defined. Types must be compatible. Syntax must be respected. A program that violates these constraints does not run; a formula that violates its constraints does not hold. In both cases, meaning is enforced through structure rather than interpretation.
        </p>

        <p className="mb-4">
          Importantly, this symbolic compression is a relatively recent development. Much of the symbolic grammar now taken for granted did not fully emerge until the early modern period; even the equals sign itself was introduced only in the 16th century. Thinkers such as Pythagoras and Euclid reasoned with extraordinary rigor, yet did so largely without the dense symbolic language of modern <em>Formula</em>. They relied instead on carefully disciplined natural language, diagrams, and shared conceptual understanding to narrow meaning.
        </p>

        <p className="mb-4">
          Today, however, <em>Formula</em> often appears suddenly—dropped onto a page or into a conversation without preparation. And many people fear it.
        </p>

        <p className="mb-4">
          That fear is understandable. Hearing Formula for the first time can feel like having a conversation partner abruptly switch into a language you don&apos;t speak. You might feel lost. You might even suspect—rightly or wrongly—that they are trying to lose you.
        </p>

        <p className="mb-4">
          The purpose of this website is simple.
        </p>

        <p className="mb-4">
          Lingua Formula exists to make learning <em>Formula</em> far easier than it usually is. Not by dumbing it down, and not by avoiding symbols—but by treating Formula as what it actually is: a specialized language with its own grammar, definitions, constraints, and contexts.
        </p>

        <p className="mb-4">
          Thinking <em>about</em> Formula as a language is not the main goal here. But maintaining the mindset that it <em>is</em> a language—and that, like any language, it becomes far more usable when someone is willing to translate its structure and intent—changes everything.
        </p>

        <p className="mb-4">
          Lingua Formula is an invitation:
        </p>

        <ul className="list-none space-y-2 mb-6">
          <li>to slow down,</li>
          <li>to translate rather than intimidate,</li>
          <li>and to discover that Formula is not an obstacle to meaning, but one of its most precise expressions.</li>
        </ul>
      </div>
    </MathJaxContext>
  );
}
