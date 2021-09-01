/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import regeneratorRuntime from 'regenerator-runtime';
import {
  searchNewUser,
  followUser,
  unfollowUser,
  getAllContacts,
  getContactEntries,
  blockUser,
  unblockUser
} from '../fetch/contactFetch';

require('isomorphic-fetch');
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  fetch.resetMocks();
});

describe('Test fetch searchNewUser with mocking', () => {
  test('fetch searchNewUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: { 
      isFollowed: true, isBlocked: false
    }}));
    const res = await searchNewUser('Alex');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch followUser with mocking', () => {
  test('fetch followUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await followUser('Bob');
    expect(res.code).toBe(0);
  });
});


describe('Test fetch unfollowUser with mocking', () => {
  test('fetch unfollowUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await unfollowUser('Bob');
    expect(res.code).toBe(0);
  });
});

describe('Test fetch getAllContacts with mocking', () => {
  test('fetch getAllContacts', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: ['Bob', 'Cara', 'Dan'] }));
    const res = await getAllContacts('Bob');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch getContactEntries with mocking', () => {
  test('fetch getContactEntries', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: { contact: 'Bob', isFollowed: true, isBlocked: false } }));
    const res = await getContactEntries();
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch blockUser with mocking', () => {
  test('fetch blockUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await blockUser('Bob');
    expect(res.code).toBe(0);
  });
});

describe('Test fetch unblockUser with mocking', () => {
  test('fetch unblockUser', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await unblockUser('Bob');
    expect(res.code).toBe(0);
  });
});
