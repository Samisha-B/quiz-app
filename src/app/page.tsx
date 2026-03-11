// src/app/page.tsx

import QuizInterface from "@/components/QuizInterface";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/70 backdrop-blur">
        <h1 className="text-lg font-semibold text-gray-800">
          AI Quiz Generator
        </h1>
        <nav className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Login / Signup
          </Link>
        </nav>
      </header>
      <QuizInterface />
    </div>
  );
}
