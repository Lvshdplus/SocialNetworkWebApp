const express = require('express');
const config = require('../config');
const jwt = require('jsonwebtoken');
const { getDB, userVerify } = require('../server');
const { videoToken, chatToken } = require('../tokens');

const router = express.Router();

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

// Live stream video routers
router.get('/video/token', (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.post('/video/token', (req, res) => {
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, config);
  sendTokenResponse(token, res);
});

router.get('/video/list', userVerify, async (req, res) => {
  try {
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: req.name });
    const contacts = userDoc.followees;
    contacts.sort();
    let nameList = [];
    let liveList = [];
    for (let i = 0; i < contacts.length; i += 1) {
      const name = contacts[i];
      const doc = await db.collection('Users').findOne({ username: name });
      const live = doc.live;
      if (live != '') {
        nameList.push(name);
        liveList.push(live);
      }
    }
    res.status(200).json({ code: 0, msg: 'Success', data: nameList, data2: liveList });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/video/start', userVerify, async (req, res) => {
  try {
    const db = getDB();
    const updateLive = await db.collection('Users').updateOne(
      { username: req.body.username },
      { $set: { live: req.body.owner } },
    );
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/video/end', userVerify, async (req, res) => {
  try {
    const db = getDB();
    const endLive = await db.collection('Users').updateOne(
      { username: req.body.username },
      { $set: { live: '' } },
    );
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

// Live stream chat routers
router.post('/chat/token', (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
})

module.exports = router;
