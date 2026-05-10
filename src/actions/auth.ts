"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";
  const callbackUrl = formData.get("callbackUrl") as string || "/";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  if (user.isBlocked) {
    return { error: "This account has been blocked" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  // Create session cookie
  await createSession(user.id, user.role, rememberMe);

  // Redirect to original page or dashboard
  redirect(callbackUrl);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
