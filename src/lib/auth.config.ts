import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize is only used server-side (not in Edge middleware)
      // The actual implementation is in auth.ts
      authorize: () => null,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const protectedPaths = ["/library", "/book", "/bookshelf", "/admin"];
      const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

      if (isProtected && !isLoggedIn) {
        return false; // Redirects to signIn page
      }

      const authPaths = ["/login", "/signup"];
      const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/library", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
};
