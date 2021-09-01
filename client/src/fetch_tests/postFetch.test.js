/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable no-undef */
import regeneratorRuntime from 'regenerator-runtime';
import {
  sendPost,
  deletePost,
  hidePost,
  getPostById,
  getAllPosts,
  getImageValue,
  sendComment,
  updateComment,
  deleteComment,
} from '../fetch/postFetch';

require('isomorphic-fetch');
require('jest-fetch-mock').enableMocks();

beforeEach(() => {
  fetch.resetMocks();
});

describe('Test fetch sendPost with mocking', () => {
  test('fetch sendPost', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Alex-1620054105057' }));
    const res = await sendPost('Hello', null, null);
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch deletePost with mocking', () => {
  test('fetch deletePost', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Alex-1620054105057' }));
    const res = await deletePost('post-Alex-1620054105057');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch hidePost with mocking', () => {
  test('fetch hidePost', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Alex-1620054105057' }));
    const res = await hidePost('post-Alex-1620054105057');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch getPostById with mocking', () => {
  test('fetch getPostById', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: {
        _id:{"$oid":"60901059f92665e135eda7a7"},
        postId: "post-Alex-1620054105057",
        author: "Alex",
        timeStamp: 1620054105057,
        content: {
          text: "I'm Alex, this is the 1st post.",
          image: null
        },
        comments:[]
      }
     }));
    const res = await getPostById('post-Alex-1620054105057');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch getAllPosts with mocking', () => {
  test('fetch getAllPosts', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: [{
        _id:{"$oid":"60901059f92665e135eda7a7"},
        postId: "post-Alex-1620054105057",
        author: "Alex",
        timeStamp: 1620054105057,
        content: {
          text: "I'm Alex, this is the 1st post.",
          image: null
        },
        comments:[]
      }] 
    }));
    const res = await getAllPosts('post-Alex-1620054105057');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch getImageValue with mocking', () => {
  test('fetch getImageValue', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'base64' }));
    const res = await getImageValue('post-Alex-1620054105057');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch sendComment with mocking', () => {
  test('fetch sendComment', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Cara-1620054195743-comment-Alex-1620282177506'
    }));
    const res = await sendComment('post-Alex-1620054105057', 'a comment', null);
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch updateComment with mocking', () => {
  test('fetch updateComment', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Cara-1620054195743-comment-Alex-1620282177506' }));
    const res = await updateComment('post-Alex-1620054105057', 'post-Cara-1620054195743-comment-Alex-1620282177506', 'new comment', null);
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});

describe('Test fetch deleteComment with mocking', () => {
  test('fetch deleteComment', async () => {
    fetch.mockResponseOnce(JSON.stringify({ code: 0, msg: 'Success', data: 'post-Cara-1620054195743-comment-Alex-1620282177506'
    }));
    const res = await deleteComment('post-Alex-1620054105057', 'a comment');
    expect(res.code).toBe(0);
    expect(res.data).not.toBeNull();
  });
});