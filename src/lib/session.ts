// src/lib/session.ts
export const SESSION_COOKIE = 'quiz-userid';
import { cookies } from "next/headers";
import { prisma } from "./db";

//const SESSION_COOKIE = "quiz_user_id";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const id = cookieStore.get(SESSION_COOKIE)?.value;
    return id || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function setUserSession(userId: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearUserSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}
