import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Params { params: { id: string }; }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { questions: true },
    });

    if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questions: quiz.questions.map((q) => ({
          question: q.text,
          options: JSON.parse(q.options),
          correctAnswer: q.correctIndex,
          explanation: q.explanation,
        })),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
