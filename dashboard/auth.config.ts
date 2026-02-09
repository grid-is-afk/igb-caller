import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isApi = nextUrl.pathname.startsWith('/api');
            const isPublicWebhook = nextUrl.pathname.startsWith('/api/webhooks');
            const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
            const isLogin = nextUrl.pathname.startsWith('/login');

            // 1. Allow public webhooks
            if (isPublicWebhook) return true;

            // 2. Protect API routes (except auth)
            if (isApi && !isAuthRoute) {
                return isLoggedIn;
            }

            // 3. Handle Login Page
            if (isLogin) {
                if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
                return true;
            }

            // 4. Protect all other routes (Dashboard)
            return isLoggedIn;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
