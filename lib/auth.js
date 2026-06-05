import CredentialsProvider from 'next-auth/providers/credentials';

/** @type {import('next-auth').NextAuthOptions} */
export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'customer',
      name: 'Customer',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/customer/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': credentials.tenantId || '',
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) return null;
          return { ...data.user, accessToken: data.accessToken };
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) return null;
          return { ...data.user, accessToken: data.accessToken };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days — persists across browser restarts
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days — matches session maxAge
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.accessToken = token.accessToken;
        session.user.phone = token.phone;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
