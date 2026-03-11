import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

interface Params { params: { id: string }; }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { score, totalQuestions } = body;

    if (typeof score !== "number" || typeof totalQuestions !== "number" || totalQuestions <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: params.id } });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    const userId = await getCurrentUserId();

    const attempt = await prisma.attempt.create({
      data: {
        quizId: quiz.id,
        userId: userId || undefined,
        score,
        totalQuestions,
      },
    });

    return NextResponse.json({ attempt });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
