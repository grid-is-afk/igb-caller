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
            console.error('Auth error type:', error.type);
            console.error('Auth error cause:', error.cause);
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                case 'CallbackRouteError':
                    return 'Authentication callback failed.';
                default:
                    return `Auth error: ${error.type}`;
            }
        }
        throw error;
    }
}
