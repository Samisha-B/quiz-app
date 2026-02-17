import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/quizGraph";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, numQuestions, difficulty } = body;

    if (!topic || numQuestions < 1 || numQuestions > 20 || !difficulty) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // FIXED SYNTAX: Proper type casting
    const result = await generateQuiz({ 
      topic, 
      numQuestions, 
      difficulty: difficulty as "easy" | "medium" | "hard" 
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ quiz: result.quiz });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
