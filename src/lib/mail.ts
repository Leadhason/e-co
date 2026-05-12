import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "StoneBase <auth@stonebase.com>",
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h1 style="font-size: 20px; font-weight: 600; color: #0f172a;">Password Reset Request</h1>
          <p style="font-size: 14px; color: #64748b; line-height: 24px;">
            We received a request to reset your password for your StoneBase administrative account. 
            Click the button below to choose a new password. This link will expire in 24 hours.
          </p>
          <a href="${resetLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Reset Password
          </a>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { error: "Failed to send reset email." };
  }
};
