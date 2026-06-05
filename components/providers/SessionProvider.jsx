'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60}        // re-fetch session every 5 minutes
      refetchOnWindowFocus={true}      // re-check auth when tab gains focus
    >
      {children}
    </NextAuthSessionProvider>
  );
}
