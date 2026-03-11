import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

interface AttemptWithQuiz {
  score: number;
  totalQuestions: number;
  createdAt: Date;
  quiz: { title: string };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await prisma.attempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { createdAt: "desc" },
    });

    const totalAttempts = attempts.length;

    const avgScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            (attempts.reduce(
              (sum: number, a: AttemptWithQuiz) =>
                sum + a.score / a.totalQuestions,
              0
            ) /
              totalAttempts) *
              100
          );

    return NextResponse.json({ totalAttempts, avgScore, attempts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
