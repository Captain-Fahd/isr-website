import './env';
import { afterAll, describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../app';
import { disconnectPrisma } from './helpers';

const app = createApp();

afterAll(async () => {
  await disconnectPrisma();
});

describe('GET /health', () => {
  test('returns OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });
});
