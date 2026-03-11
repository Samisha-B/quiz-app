import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/quizGraph";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, numQuestions, difficulty } = body;

    if (!topic || numQuestions < 1 || numQuestions > 20 || !difficulty) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await generateQuiz({ topic, numQuestions, difficulty });

    if (result.error || !result.quiz) {
      return NextResponse.json({ error: result.error || "Failed to generate quiz" }, { status: 500 });
    }

    const userId = await getCurrentUserId();

    const createdQuiz = await prisma.quiz.create({
      data: {
        title: result.quiz.title,
        description: result.quiz.description,
        topic,
        difficulty,
        userId: userId || undefined,
        questions: {
          create: result.quiz.questions.map((q) => ({
            text: q.question,
            options: JSON.stringify(q.options),
            correctIndex: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
    });

    return NextResponse.json({ quiz: result.quiz, quizId: createdQuiz.id });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
