import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/smtp";
import crypto from "crypto";

const VERIFY_TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, referredBy } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Next waitlist number = max + 1 (default 234 for first user)
    const { _max } = await prisma.user.aggregate({
      _max: { waitlistNumber: true },
    });
    const nextWaitlistNumber = ( _max?.waitlistNumber ?? 233 ) + 1;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (no subscription until email is verified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        waitlistNumber: nextWaitlistNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        waitlistNumber: true,
        createdAt: true,
      },
    });

    // Credit referrer if valid (move up 1 on waitlist + 1 day free)
    if (referredBy && referredBy !== user.id) {
      const referrer = await prisma.user.findUnique({
        where: { id: referredBy },
        select: { id: true, waitlistNumber: true, subscriptionExpiresAt: true },
      });
      if (referrer) {
        const newWaitlist = Math.max(1, referrer.waitlistNumber - 1);
        const baseExpiry =
          referrer.subscriptionExpiresAt && referrer.subscriptionExpiresAt > new Date()
            ? referrer.subscriptionExpiresAt
            : new Date();
        const newExpiry = new Date(baseExpiry);
        newExpiry.setDate(newExpiry.getDate() + 1);
        await prisma.$transaction([
          prisma.user.update({
            where: { id: referrer.id },
            data: {
              waitlistNumber: newWaitlist,
              subscriptionExpiresAt: newExpiry,
            },
          }),
          prisma.history.create({
            data: {
              userId: referrer.id,
              action: "referral_reward",
              description: "Invite a friend: moved up 1 on waitlist + 1 day free",
              metadata: { referredEmail: email, newWaitlistNumber: newWaitlist },
            },
          }),
        ]);
      }
    }

    // Create email verification token (one per email; replace any existing)
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + VERIFY_TOKEN_EXPIRY_HOURS);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: verifyToken, expires },
    });

    await sendWelcomeEmail(user.email, user.name, verifyToken);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

