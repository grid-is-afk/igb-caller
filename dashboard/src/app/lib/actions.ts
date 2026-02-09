'use server';

import { signIn } from '../../../auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            const causeErr = (error.cause as { err?: Error })?.err;
            console.error('Auth error type:', error.type);
            console.error('Auth error message:', error.message);
            console.error('Auth error cause:', causeErr?.message || 'unknown');
            console.error('Auth error stack:', causeErr?.stack || error.stack);
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
