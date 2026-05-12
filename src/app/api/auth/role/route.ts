import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await verifySession();
  if (!session.isAuth) {
    return NextResponse.json({ role: "GUEST" }, { status: 401 });
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.userId },
    select: { role: true }
  });

  return NextResponse.json({ role: user?.role || "EMPLOYEE" });
}
