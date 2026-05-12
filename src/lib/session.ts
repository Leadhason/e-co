import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";


const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  role: Role;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(key);
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) return null;
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string, role: Role, rememberMe: boolean = false) {
  const expiresAt = new Date(Date.now() + (rememberMe ? 7 * 24 : 24) * 60 * 60 * 1000); // 7 days or 1 day
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

export async function verifySession(checkDb = true) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return { isAuth: false };
  }

  if (checkDb) {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { isBlocked: true }
      });

      if (!user || user.isBlocked) {
        return { isAuth: false };
      }
    } catch (error) {
      console.error("Database session verification failed:", error);
      // Fail secure in production if DB is down, or proceed if preferred
      // For now, we fail secure.
      return { isAuth: false };
    }
  }

  return { isAuth: true, userId: session.userId, role: session.role };
}



export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}