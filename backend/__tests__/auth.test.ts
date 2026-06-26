import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

// Must be prefixed with "mock" so jest.mock's hoisted factory can reference it
const mockSignInWithPassword =
    jest.fn<(creds: { email: string; password: string }) => Promise<any>>();

jest.mock('@supabase/supabase-js', () => ({
    createClient: () => ({
        auth: { signInWithPassword: mockSignInWithPassword },
    }),
}));

import { signIn } from '../controllers/authController';

afterEach(() => {
    jest.clearAllMocks();
});

test('signIn returns data on success', async () => {
    const fakeData = {
        user: { id: '123', email: 'admin@isr.org' },
        session: { access_token: 'token' },
    };
    mockSignInWithPassword.mockResolvedValue({ data: fakeData, error: null });

    const req = { body: { email: 'admin@isr.org', password: 'secret' } } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;

    await signIn(req, res);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'admin@isr.org',
        password: 'secret',
    });
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: fakeData });
});

test('signIn returns 400 on error', async () => {
    mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
    });

    const req = { body: { email: 'admin@isr.org', password: 'wrong' } } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;

    await signIn(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid login credentials' });
});
