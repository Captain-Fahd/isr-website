import { test, expect, jest, afterEach } from '@jest/globals';
import { Request, Response } from 'express';

const mockSignInWithPassword =
    jest.fn<(creds: { email: string; password: string }) => Promise<any>>();
const mockGetUser = jest.fn<(token: string) => Promise<any>>();

jest.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: mockSignInWithPassword,
            getUser: mockGetUser,
        },
    },
}));

import { signIn, getMe } from '../controllers/authController';
import { checkAuth } from '../middleware/checkAuth';

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
    const next = jest.fn();

    await signIn(req, res, next);

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
    const next = jest.fn();

    await signIn(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: 'Invalid login credentials' });
});

test('checkAuth returns 401 when Authorization header is missing', async () => {
    const req = { headers: {} } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
});

test('checkAuth returns 401 when token is invalid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid JWT' } });

    const req = { headers: { authorization: 'Bearer bad-token' } } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(mockGetUser).toHaveBeenCalledWith('bad-token');
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
});

test('checkAuth returns 403 when user is not an admin', async () => {
    mockGetUser.mockResolvedValue({
        data: { user: { id: '123', app_metadata: { role: 'member' } } },
        error: null,
    });

    const req = { headers: { authorization: 'Bearer valid-token' } } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
});

test('checkAuth calls next and attaches user for admin token', async () => {
    const adminUser = { id: '123', email: 'admin@isr.org', app_metadata: { role: 'admin' } };
    mockGetUser.mockResolvedValue({ data: { user: adminUser }, error: null });

    const req = { headers: { authorization: 'Bearer valid-token' } } as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(req.user).toEqual(adminUser);
    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
});

test('getMe returns the authenticated user', () => {
    const adminUser = { id: '123', email: 'admin@isr.org', app_metadata: { role: 'admin' } };
    const req = { user: adminUser } as unknown as Request;
    const json = jest.fn();
    const status = jest.fn((_code: number) => ({ json }));
    const res = { json, status } as unknown as Response;

    getMe(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ data: { user: adminUser } });
});
