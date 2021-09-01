/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import regeneratorRuntime from 'regenerator-runtime';
import {
  register,
  login,
  resetPasswordPage,
  getProfile,
  deactivateUser,
  verify,
} from '../fetch/authFetch';

require('isomorphic-fetch');
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  fetch.resetMocks();
});

describe('Test fetch register with mocking', () => {
  test('fetch register', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: {
      result: { n: 1, ok: 1 }, insertedCount: 1,
    }}));
    const res = await register('Alex', 'cis557', 'What is your major?', 'CS');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch login with mocking', () => {
  test('fetch login', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: null }));
    const res = await login('Alex', 'cis557');
    expect(res.code).toBe(0);
  });
});

describe('Test fetch resetPasswordPage with mocking', () => {
  test('fetch resetPasswordPage', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: {
      result: { n: 1, ok: 1 }, updateCount: 1,
    }}));
    const res = await resetPasswordPage('Alex', 'cis557', 'What is your major?', 'CS');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch getProfile with mocking', () => {
  test('fetch getProfile', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: {
      profileId: 'profile-Alex'
    }}));
    const res = await getProfile('Alex');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch deactivateUser with mocking', () => {
  test('fetch deactivateUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: null}));
    const res = await deactivateUser();
    expect(res.code).toBe(0);
  });
});

describe('Test fetch verify with mocking', () => {
  test('fetch verify', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'success', data: 'Alex' }));
    const res = await verify();
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});