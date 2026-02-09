'use server';

import { signIn } from '../../../auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            username: formData.get('username') as string,
            password: formData.get('password') as string,
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            const causeErr = (error.cause as { err?: Error })?.err;
            console.error('Auth error type:', error.type);
            console.error('Auth error cause:', causeErr?.message || error.message);
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                case 'CallbackRouteError':
                    return `Callback failed: ${causeErr?.message || 'unknown error'}`;
                default:
                    return `Auth error: ${error.type}`;
            }
        }
        throw error;
    }
}
