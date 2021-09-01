/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import regeneratorRuntime from 'regenerator-runtime';
import {
  sendMsg,
  getMsg,
  sendImgMsg,
  sendAudioMsg,
  getAudioValue
} from '../fetch/messageFetch';

require('isomorphic-fetch');
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  fetch.resetMocks();
});

describe('Test fetch sendMsg with mocking', () => {
  test('fetch sendMsg', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await sendMsg('Bob', 'Hi');
    expect(res.code).toBe(0);
  });
});

describe('Test fetch getMsg with mocking', () => {
  test('fetch getMsg', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: [{contact: 'Bob', messages: {sender: 'Bob', receiver: 'Alex', timeStamp: 1620478002907, type: 'text', content: 'Hi Alex'}}] }));
    const res = await getMsg();
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch sendImgMsg with mocking', () => {
  test('fetch sendImgMsg', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await sendImgMsg('Bob', null);
    expect(res.code).toBe(0);
  });
});

describe('Test fetch sendAudioMsg with mocking', () => {
  test('fetch sendAudioMsg', async () => {
    const blob = new Blob([Buffer.from('/home/abc.mp3', 'binary')]);
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: null }));
    const res = await sendAudioMsg('Bob', blob);
    expect(res.code).toBe(0);
  });
});