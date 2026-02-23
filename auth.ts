import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/resend";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          return null;
        }

        // Skip password check for OAuth users
        if (!user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
          waitlistNumber: user.waitlistNumber,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
    signOut: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, waitlistNumber: true },
          });

          if (!existingUser) {
            // Create new user for Google OAuth (email already verified by Google → 1 day free)
            const now = new Date();
            const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const { _max } = await prisma.user.aggregate({
              _max: { waitlistNumber: true },
            });
            const nextWaitlistNumber = (_max?.waitlistNumber ?? 233) + 1;
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                password: null,
                emailVerified: now,
                subscriptionExpiresAt: oneDayLater,
                waitlistNumber: nextWaitlistNumber,
              },
            });
            user.id = newUser.id;
            (user as any).subscriptionExpiresAt = oneDayLater;
            (user as any).waitlistNumber = nextWaitlistNumber;
            console.log("Sending welcome email to", newUser.email);
            await sendWelcomeEmail(newUser.email, newUser.name);
            console.log("Welcome email sent to", newUser.email);
          } else {
            user.id = existingUser.id;
            (user as any).waitlistNumber = existingUser.waitlistNumber;
          }
        } catch (error) {
          console.error("Error in Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.subscriptionExpiresAt = (user as any).subscriptionExpiresAt ?? null;
        token.waitlistNumber = (user as any).waitlistNumber ?? null;
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { subscriptionExpiresAt: true, waitlistNumber: true },
        });
        if (dbUser) {
          token.subscriptionExpiresAt = dbUser.subscriptionExpiresAt;
          token.waitlistNumber = dbUser.waitlistNumber;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.subscriptionExpiresAt = token.subscriptionExpiresAt
          ? new Date(token.subscriptionExpiresAt as string)
          : null;
        session.user.waitlistNumber = (token.waitlistNumber as number) ?? null;
      }
      return session;
    },
  },
});
