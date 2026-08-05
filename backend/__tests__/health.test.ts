import { test, expect, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { healthCheck } from '../controllers/healthController';

test('healthCheck responds with OK', () => {
  const send = jest.fn();
  const res = { send } as unknown as Response;

  healthCheck({} as Request, res);

  expect(send).toHaveBeenCalledWith('OK');
});
