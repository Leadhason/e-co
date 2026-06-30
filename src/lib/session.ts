import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decrypt, type SessionPayload } from "./session.edge";

export type { SessionPayload };

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(key);
}

export async function createSession(userId: string, role: Role, rememberMe = false) {
  const expiresAt = new Date(Date.now() + (rememberMe ? 7 * 24 : 24) * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

// Full version — includes DB check for blocked users
export async function verifySession(checkDb = true) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) return { isAuth: false };

  if (checkDb) {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { isBlocked: true },
      });
      if (!user || user.isBlocked) return { isAuth: false };
    } catch {
      return { isAuth: false };
    }
  }

  return { isAuth: true, userId: session.userId, role: session.role };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}