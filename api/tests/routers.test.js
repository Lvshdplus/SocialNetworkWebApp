/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable prefer-template */
/* eslint-disable quote-props */
import regeneratorRuntime from 'regenerator-runtime';

require('@babel/polyfill');
const request = require('supertest');
// Import MongoDB module
const { MongoClient } = require('mongodb');
const { webapp, server } = require('../server');

const agent = request.agent(server);

/*
 * init database
 */
let url;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  url = process.env.LOCAL_DB_URL;
} else if (process.env.NODE_ENV === 'test') {
  url = 'mongodb+srv://team14:cis557@cluster0.tzp9j.mongodb.net/Webapp?retryWrites=true&w=majority';
} else {
  url = process.env.DB_URL;
}

// url = process.env.LOCAL_DB_URL;

// Connect to db
const connect = async () => {
  try {
    console.log(`test: db url is ${url}`);
    const tmp = (await MongoClient.connect(url,
      { useNewUrlParser: true, useUnifiedTopology: true })).db();
    // Connected to db
    console.log(`test: Connected to database: ${tmp.databaseName}`);
    return tmp;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

let db;
beforeAll(async () => {
  db = await connect();
});

let jwtToken;
let verifyHeader;
const qUserName = '__test';
const qpassword = 'cis557';
const qProfileId = `profile-${qUserName}`;
const qSafeQuestion = 'What is your major?';
const qSafeAnswer = 'CS';
const qContactName = '__test_1';
const qContactProfileId = `profile-${qContactName}`;
let qPostId;
let qCommentId;
// ---------------------authentication-------------------------
describe('test Authentication routers', () => {
  test('test /api/register', async () => {
    const best = await request(server).post('/api/register').send({
      username: qUserName,
      password: qpassword,
      safeQuestion: qSafeQuestion,
      safeAnswer: qSafeAnswer,
    }).expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/login', async () => {
    const best = await request(webapp).post('/api/login').send({
      username: qUserName,
      password: qpassword,
    }).expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
        jwtToken = res.data;
        verifyHeader = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwtToken,
        };
      });
  });

  test('test /api/verify', async () => {
    const best = await request(webapp).get('/api/verify').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
        expect(res.data).toEqual('__test');
      });
  });

  test('test /api/resetPasswordPage', async () => {
    const best = await request(webapp).post('/api/resetPasswordPage').set(verifyHeader)
      .send({
        username: qUserName,
        password: qpassword,
        safeQuestion: qSafeQuestion,
        safeAnswer: qSafeAnswer,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/getProfile', async () => {
    const best = await request(webapp).post('/api/getProfile').set(verifyHeader)
      .send({
        username: qUserName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });
});

// -----------------------------contact------------------------------
describe('test Contact routers', () => {
  test('init contact', async () => {
    const best = await request(server).post('/api/register').send({
      username: qContactName,
      password: qpassword,
      safeQuestion: qSafeQuestion,
      safeAnswer: qSafeAnswer,
    }).expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/searchNewUser', async () => {
    const best = await request(webapp).post('/api/searchNewUser').set(verifyHeader)
      .send({
        username: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/follow', async () => {
    const best = await request(webapp).post('/api/follow').set(verifyHeader)
      .send({
        username: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/getAllContacts', async () => {
    const best = await request(webapp).get('/api/getAllContacts').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/getContactEntries', async () => {
    const best = await request(webapp).get('/api/getContactEntries').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/blockUser', async () => {
    const best = await request(webapp).post('/api/blockUser').set(verifyHeader)
      .send({
        blockedUser: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/unblockUser', async () => {
    const best = await request(webapp).post('/api/unblockUser').set(verifyHeader)
      .send({
        blockedUser: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/follow', async () => {
    const best = await request(webapp).post('/api/follow').set(verifyHeader)
      .send({
        username: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });
});

// -----------------------------post------------------------------
describe('test Post routers', () => {
  test('test /api/sendPost', async () => {
    const best = await request(server).post('/api/sendPost').set(verifyHeader)
      .send({
        textValue: 'hello world',
        imageValue: null,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
        qPostId = res.data;
      });
  });

  test('test /api/getPostById', async () => {
    const best = await request(server).post('/api/getPostById').set(verifyHeader)
      .send({
        postId: qPostId,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/sendComment', async () => {
    const best = await request(server).post('/api/sendComment').set(verifyHeader)
      .send({
        postId: qPostId,
        commentValue: 'test send comment',
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
        qCommentId = res.data;
      });
  });

  test('test /api/updateComment', async () => {
    const best = await request(server).post('/api/updateComment').set(verifyHeader)
      .send({
        postId: qPostId,
        commentId: qCommentId,
        commentValue: 'update comment',
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/getAllPosts', async () => {
    const best = await request(server).get('/api/getAllPosts').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/hidePost', async () => {
    const best = await request(server).post('/api/hidePost').set(verifyHeader)
      .send({
        postId: qPostId,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });
});

// -----------------------------message------------------------------
describe('test Message routers', () => {
  const to = qContactName;
  const msg = 'Hello world';
  const image = null;
  test('test /api/sendMsg', async () => {
    const best = await request(server).post('/api/sendMsg').set(verifyHeader)
      .send({
        to,
        msg,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/getMsg', async () => {
    const best = await request(webapp).get('/api/getMsg').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/sendImage', async () => {
    const best = await request(server).post('/api/sendImage').set(verifyHeader)
      .send({
        to,
        image,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });
});

// --------------------------invalid auth----------------------------
describe('test Authentication routers under invalid conditions', () => {
  test('test /api/register with existed username', async () => {
    const best = await request(webapp).post('/api/register').send({
      username: qUserName,
      password: qpassword,
      safeQuestion: qSafeQuestion,
      safeAnswer: qSafeAnswer,
    }).expect(409)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/register with empty username', async () => {
    const best = await request(webapp).post('/api/register').send({
      password: qpassword,
    }).expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/login with empty username', async () => {
    const best = await request(webapp).post('/api/login').send({
      password: 'cis557',
    }).expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/login with non-existed username', async () => {
    const best = await request(webapp).post('/api/login').send({
      username: '__test_not',
      password: 'cis557',
    }).expect(404)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/login with invalid password three times', async () => {
    const best = await request(webapp).post('/api/login').send({
      username: '__test',
      password: 'invalid_password',
    }).expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
    await request(webapp).post('/api/login').send({
      username: '__test',
      password: 'invalid_password',
    });
    await request(webapp).post('/api/login').send({
      username: '__test',
      password: 'invalid_password',
    });
  });

  test('test /api/login in locked state', async () => {
    const best = await request(webapp).post('/api/login').send({
      username: '__test',
      password: 'cis557',
    }).expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });
});

// --------------------------invalid post-------------------------------
describe('test Post routers under invalid conditions', () => {
  test('test /api/getImageValue with invalid imageKey', async () => {
    const best = await request(webapp).post('/api/getImageValue').set(verifyHeader)
      .send({
        imageKey: 'fjasoifdsoaohfdsa',
      })
      .expect(400)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });
});

// --------------------------invalid contact----------------------------
describe('test Contact routers under invalid conditions', () => {
  test('test /api/searchNewUser with empty contactname', async () => {
    const best = await request(webapp).post('/api/searchNewUser').set(verifyHeader)
      .send({
      })
      .expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/follow with empty contactname', async () => {
    const best = await request(webapp).post('/api/follow').set(verifyHeader)
      .send({
      })
      .expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/unfollow with empty contactname', async () => {
    const best = await request(webapp).post('/api/unfollow').set(verifyHeader)
      .send({
      })
      .expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/blockUser with empty contactname', async () => {
    const best = await request(webapp).post('/api/blockUser').set(verifyHeader)
      .send({
      })
      .expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });

  test('test /api/unblockUser with empty contactname', async () => {
    const best = await request(webapp).post('/api/unblockUser').set(verifyHeader)
      .send({
      })
      .expect(403)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(-1);
      });
  });
});

// --------------------------deconstructor----------------------------------
describe('test deconstructor routers', () => {
  test('test /api/deleteComment', async () => {
    const best = await request(server).post('/api/deleteComment').set(verifyHeader)
      .send({
        postId: qPostId,
        commentId: qCommentId,
      })
      .then((response) => {
        const res = JSON.parse(response.text);
      });
  });

  test('test /api/deletePost', async () => {
    const best = await request(server).post('/api/deletePost').set(verifyHeader)
      .send({
        postId: qPostId,
      })
      .then((response) => {
        const res = JSON.parse(response.text);
      });
  });

  test('test /api/unfollow', async () => {
    const best = await request(webapp).post('/api/follow').set(verifyHeader)
      .send({
        username: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/deactivateUser', async () => {
    const best = await request(webapp).get('/api/deactivateUser').set(verifyHeader)
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/deleteUser', async () => {
    await request(webapp).delete('/api/deleteUser').set(verifyHeader)
      .send({
        username: qUserName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('delete contact', async () => {
    await request(webapp).delete('/api/deleteUser').set(verifyHeader)
      .send({
        username: qContactName,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('test /api/deleteProfile', async () => {
    await request(webapp).delete('/api/deleteProfile').set(verifyHeader)
      .send({
        profileId: qProfileId,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });

  test('delete contact profile', async () => {
    await request(webapp).delete('/api/deleteProfile').set(verifyHeader)
      .send({
        profileId: qContactProfileId,
      })
      .expect(200)
      .then((response) => {
        const res = JSON.parse(response.text);
        expect(res.code).toEqual(0);
      });
  });
});
