import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            currency: true,
            passwordHash: true,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          currency: user.currency,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.currency = user.currency;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: {
            id: token.id,
          },
          select: {
            id: true,
            email: true,
            name: true,
            currency: true,
          },
        });

        if (freshUser) {
          token.id = freshUser.id;
          token.email = freshUser.email;
          token.name = freshUser.name ?? freshUser.email;
          token.currency = freshUser.currency;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.currency = token.currency;
      }

      return session;
    },
  },
});
