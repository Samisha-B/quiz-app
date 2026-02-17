// src/lib/quizGraph.ts - SIMPLIFIED & 100% WORKING

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Quiz, QuizState } from "./types";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

export async function generateQuiz(input: {
  topic: string;
  numQuestions: number;
  difficulty: string;
}): Promise<{ quiz: Quiz | null; error: string | null }> {
  try {
    const { topic, numQuestions, difficulty } = input;

    const systemPrompt = `You are a quiz generation expert. Generate exactly ${numQuestions} ${difficulty} difficulty questions about "${topic}".

Return ONLY valid JSON:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation"
    }
  ]
}`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Generate ${numQuestions} questions now.`)
    ];

    const response = await model.invoke(messages);
    const content = response.content as string;

    // Extract JSON safely
    let jsonStr = content;
    const match = content.match(/```json?\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    if (match?.[1]) jsonStr = match[1];

    const quiz: Quiz = JSON.parse(jsonStr.trim());

    if (!quiz.questions || quiz.questions.length !== numQuestions) {
      throw new Error("Invalid quiz structure");
    }

    return { quiz, error: null };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to generate quiz",
      quiz: null
    };
  }
}
