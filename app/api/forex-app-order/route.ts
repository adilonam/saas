import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const FOREX_PRODUCT = "forex-trading-app";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      product: FOREX_PRODUCT,
      status: "PAID",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      product: true,
      status: true,
      amountCents: true,
      currency: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ order });
}
