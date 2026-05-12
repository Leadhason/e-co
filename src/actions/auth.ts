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

import { sendPasswordResetEmail } from "@/lib/mail";

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    return { success: true, message: "If an account exists with this email, you will receive a reset link." };
  }

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt }
    });

    await sendPasswordResetEmail(email, token);
    return { success: true, message: "Reset link sent to your email." };
  } catch (error) {
    return { error: "Failed to process request." };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) return { error: "Invalid request." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "Invalid or expired token." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.$transaction([
      prisma.adminUser.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    ]);

    return { success: true };
  } catch (error) {
    return { error: "Failed to reset password." };
  }
}

