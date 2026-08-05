import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from 'undici';
import {
  aladhanCalendarPayload,
  aladhanTimingsPayload,
  weatherPayload,
} from './fixtures';

let mockAgent: MockAgent | null = null;
let previousDispatcher: ReturnType<typeof getGlobalDispatcher> | null = null;

/** Intercept Aladhan, WeatherAPI, and Resend HTTP calls for e2e/integration servers. */
export function installFetchMocks() {
  if (mockAgent) return mockAgent;

  previousDispatcher = getGlobalDispatcher();
  mockAgent = new MockAgent();
  mockAgent.disableNetConnect();
  setGlobalDispatcher(mockAgent);

  const aladhan = mockAgent.get('https://api.aladhan.com');
  aladhan
    .intercept({ path: /\/v1\/timings\/.*/, method: 'GET' })
    .reply(200, aladhanTimingsPayload)
    .persist();
  aladhan
    .intercept({ path: /\/v1\/calendar\/.*/, method: 'GET' })
    .reply(200, aladhanCalendarPayload)
    .persist();

  const weather = mockAgent.get('https://api.weatherapi.com');
  weather
    .intercept({ path: /\/v1\/current\.json.*/, method: 'GET' })
    .reply(200, weatherPayload)
    .persist();

  const resend = mockAgent.get('https://api.resend.com');
  resend
    .intercept({ path: '/emails', method: 'POST' })
    .reply(200, { id: 'mock-email-id' })
    .persist();

  return mockAgent;
}

export function restoreFetchMocks() {
  if (previousDispatcher) {
    setGlobalDispatcher(previousDispatcher);
  }
  mockAgent?.close();
  mockAgent = null;
  previousDispatcher = null;
}
