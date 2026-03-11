import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Quiz } from "./types";

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
  const { topic, numQuestions, difficulty } = input;

  try {
    const systemPrompt = `You are a quiz generation expert. Generate exactly ${numQuestions} ${difficulty} difficulty questions about "${topic}".

Return ONLY valid JSON with no extra text:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Generate ${numQuestions} questions now.`),
    ];

    const response = await model.invoke(messages);
    const content = response.content as string;

    let jsonStr = content;
    const match = content.match(/```json?\s*([\s\S]*?)\s*```/);
    if (match?.[1]) {
      jsonStr = match[1];
    } else {
      const objMatch = content.match(/\{[\s\S]*\}/);
      if (objMatch) jsonStr = objMatch[0];
    }

    const quiz: Quiz = JSON.parse(jsonStr.trim());

    if (!quiz.questions || quiz.questions.length !== numQuestions) {
      throw new Error("Invalid quiz structure");
    }

    return { quiz, error: null };
  } catch (error) {
    console.error(error);
    return { quiz: null, error: "Failed to generate quiz" };
  }
}
