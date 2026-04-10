// src/lib/quizGraph.ts

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { Quiz, QuizQuestion } from "./types";

// ── 1. State Schema ────────────────────────────────────────────────────────────
const QuizStateAnnotation = Annotation.Root({
  topic:        Annotation<string>(),
  numQuestions: Annotation<number>(),
  difficulty:   Annotation<string>(),
  outline:      Annotation<string[]>({
    default: () => [],
    reducer: (_prev, next) => next,
  }),
  quiz: Annotation<Quiz | null>({
    default: () => null,
    reducer: (_prev, next) => next,
  }),
  error: Annotation<string | null>({
    default: () => null,
    reducer: (_prev, next) => next,
  }),
  retries: Annotation<number>({
    default: () => 0,
    reducer: (_prev, next) => next,
  }),
});

type QuizState = typeof QuizStateAnnotation.State;

// ── 2. LLM Instance ────────────────────────────────────────────────────────────
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

// ── 3. Node 1 — Generate Outline ──────────────────────────────────────────────
async function generateOutlineNode(state: QuizState): Promise<Partial<QuizState>> {
  const { topic, numQuestions, difficulty } = state;

  const response = await model.invoke([
    new SystemMessage(`You are a quiz curriculum designer.
Generate exactly ${numQuestions} short subtopic bullets for a ${difficulty} quiz about "${topic}".
Return ONLY a valid JSON array of strings, no markdown, no explanation.
Example: ["Subtopic 1", "Subtopic 2"]`),
    new HumanMessage(`Topic: ${topic}`),
  ]);

  try {
    const raw = (response.content as string)
      .replace(/```json?|```/g, "")
      .trim();
    const outline: string[] = JSON.parse(raw);
    return { outline };
  } catch {
    // Fallback outline if parsing fails
    const fallback = Array.from(
      { length: numQuestions },
      (_, i) => `${topic} — concept ${i + 1}`
    );
    return { outline: fallback };
  }
}

// ── 4. Node 2 — Generate Quiz Questions ───────────────────────────────────────
async function generateQuestionsNode(state: QuizState): Promise<Partial<QuizState>> {
  const { topic, numQuestions, difficulty, outline } = state;

  const outlineText = outline
    .map((o, i) => `${i + 1}. ${o}`)
    .join("\n");

  const systemPrompt = `You are an expert quiz writer.
Using the outline below, write exactly ${numQuestions} ${difficulty}-difficulty multiple-choice questions about "${topic}".

Outline:
${outlineText}

Rules:
- Each question must have exactly 4 options (A, B, C, D as plain text, NOT "A) ..." format)
- correctAnswer is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D)
- explanation must be 1-2 sentences

Return ONLY valid JSON in this exact structure, no markdown, no extra text:
{
  "title": "Quiz about ${topic}",
  "description": "A ${difficulty} quiz covering ${topic}",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Because..."
    }
  ]
}`;

  try {
    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Generate ${numQuestions} questions now.`),
    ]);

    const content = response.content as string;

    // Extract JSON from possible markdown code block
    const jsonMatch =
      content.match(/```json\s*([\s\S]*?)\s*```/) ||
      content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content.trim();

    // Find the outermost JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!objectMatch) throw new Error("No JSON object found in response");

    const quiz: Quiz = JSON.parse(objectMatch[0]);
    return { quiz, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { quiz: null, error: `Question generation failed: ${message}` };
  }
}

// ── 5. Node 3 — Validate Quiz ─────────────────────────────────────────────────
async function validateQuizNode(state: QuizState): Promise<Partial<QuizState>> {
  const { quiz, numQuestions, retries } = state;

  if (!quiz) {
    return { error: "No quiz object to validate", retries: retries + 1 };
  }

  const issues: string[] = [];

  if (!quiz.title?.trim())       issues.push("Missing title");
  if (!quiz.description?.trim()) issues.push("Missing description");

  if (!Array.isArray(quiz.questions)) {
    issues.push("questions is not an array");
  } else {
    if (quiz.questions.length !== numQuestions) {
      issues.push(`Expected ${numQuestions} questions, got ${quiz.questions.length}`);
    }

    quiz.questions.forEach((q: QuizQuestion, i: number) => {
      if (!q.question?.trim())
        issues.push(`Q${i + 1}: missing question text`);
      if (!Array.isArray(q.options) || q.options.length !== 4)
        issues.push(`Q${i + 1}: must have exactly 4 options`);
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3)
        issues.push(`Q${i + 1}: correctAnswer must be 0–3`);
      if (!q.explanation?.trim())
        issues.push(`Q${i + 1}: missing explanation`);
    });
  }

  if (issues.length > 0) {
    console.warn(`[QuizGraph] Validation failed (attempt ${retries + 1}):`, issues);
    return { quiz: null, error: issues.join(" | "), retries: retries + 1 };
  }

  console.log(`[QuizGraph] Quiz validated successfully.`);
  return { quiz, error: null };
}

// ── 6. Conditional Edge: Retry or Finish ──────────────────────────────────────
function retryOrEnd(state: QuizState): "generateQuestions" | typeof END {
  // Retry up to 2 times if validation failed
  if (state.error !== null && state.retries < 2) {
    console.log(`[QuizGraph] Retrying... attempt ${state.retries}`);
    return "generateQuestions";
  }
  return END;
}

// ── 7. Build & Compile the Graph ──────────────────────────────────────────────
const workflow = new StateGraph(QuizStateAnnotation)
  .addNode("generateOutline",   generateOutlineNode)
  .addNode("generateQuestions", generateQuestionsNode)
  .addNode("validateQuiz",      validateQuizNode)
  .addEdge(START,                "generateOutline")
  .addEdge("generateOutline",   "generateQuestions")
  .addEdge("generateQuestions", "validateQuiz")
  .addConditionalEdges("validateQuiz", retryOrEnd);

export const quizGraph = workflow.compile();

// ── 8. Public Export Function ─────────────────────────────────────────────────
export async function generateQuiz(input: {
  topic: string;
  numQuestions: number;
  difficulty: string;
}): Promise<{ quiz: Quiz | null; error: string | null }> {
  try {
    const result = await quizGraph.invoke({
      topic:        input.topic,
      numQuestions: input.numQuestions,
      difficulty:   input.difficulty,
    });

    return {
      quiz:  result.quiz  ?? null,
      error: result.error ?? null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Graph execution failed";
    console.error("[QuizGraph] Fatal error:", err);
    return { quiz: null, error: message };
  }
}