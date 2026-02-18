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
          });

          if (!existingUser) {
            // Create new user for Google OAuth (email already verified by Google → 1 day free)
            const now = new Date();
            const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || null,
                password: null,
                emailVerified: now,
                subscriptionExpiresAt: oneDayLater,
              },
            });
            user.id = newUser.id;
            (user as any).subscriptionExpiresAt = oneDayLater;
            console.log("Sending welcome email to", newUser.email);
            await sendWelcomeEmail(newUser.email, newUser.name);
            console.log("Welcome email sent to", newUser.email);
          } else {
            user.id = existingUser.id;
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
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { subscriptionExpiresAt: true },
        });
        if (dbUser) {
          token.subscriptionExpiresAt = dbUser.subscriptionExpiresAt;
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
      }
      return session;
    },
  },
});
