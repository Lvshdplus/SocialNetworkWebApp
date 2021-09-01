/* eslint-disable no-console */
/* eslint-disable no-useless-return */
/* eslint-disable no-useless-catch */
const express = require('express');
// const { check, validationResult } = require('express-validator');
// const jwt = require('jsonwebtoken');
const multer = require('multer');
const multerS3 = require('multer-s3');

const {
  getDB, getWS, userVerify, getS3, getBucketName,
  connectedUsers,
} = require('../server');

const router = express.Router();

router.post('/sendMsg', userVerify, async (req, res) => {
  if (!req.body.to || !req.body.msg) {
    res.status(403).json({ code: -1, msg: 'Missing receiver or message!', data: null });
  }
  console.log('access /api/sendMsg');
  try {
    const db = getDB();
    // send to wss to notify users
    const io = getWS();
    const sender = req.name;
    const receiver = req.body.to;
    const { msg } = req.body;
    const date = new Date();
    const dbMessage = {
      sender,
      receiver,
      timeStamp: date.getTime(),
      type: 'text',
      content: msg,
    };
    // check if sender is blocked by receiver
    // const wsMessage = { type: 'message', data: dbMessage };
    if (connectedUsers.has(receiver)) {
      const recvId = connectedUsers.get(receiver);
      io.to(recvId).emit('new message', dbMessage);
    }

    if (connectedUsers.has(sender)) {
      const sendId = connectedUsers.get(sender);
      io.to(sendId).emit('delivered message', dbMessage);
    }
    // store messages in DB
    // update sender's doc
    // message: [{ contact: contactName, messages: [ msg1, msg2, ... ] }]
    const senderDoc = await db.collection('Users').findOne({ username: sender });
    const senderMsgs = senderDoc.messages;
    const index1 = senderMsgs.findIndex((user) => user.contact === receiver);
    if (index1 === -1) { // no such user, first time to send msg
      senderMsgs.push({ contact: receiver, messages: [dbMessage] });
    } else {
      senderMsgs[index1].messages.push(dbMessage);
    }
    console.log(`Sender: ${sender} msg: ${senderMsgs}`);
    await db.collection('Users').updateOne(
      { username: sender },
      { $set: { messages: senderMsgs } },
    );
    // update receiver's doc
    const receiverDoc = await db.collection('Users').findOne({ username: receiver });
    const receiverMsgs = receiverDoc.messages;
    const index2 = receiverMsgs.findIndex((user) => user.contact === sender);
    if (index2 === -1) {
      receiverMsgs.push({ contact: sender, messages: [dbMessage] });
    } else {
      receiverMsgs[index2].messages.push(dbMessage);
    }
    console.log(`Receiver: ${receiver} msg: ${receiverMsgs}`);
    await db.collection('Users').updateOne(
      { username: receiver },
      { $set: { messages: receiverMsgs } },
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.get('/getMsg', userVerify, async (req, res) => {
  console.log('access /api/getMsg, ', req.name);
  try {
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: req.name });
    // console.log(userDoc);
    const msgs = userDoc.messages;

    console.log('msgs: ', msgs);
    res.status(200).json({ code: 0, msg: 'Success', data: msgs });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/sendImage', userVerify, async (req, res) => {
  console.log('access /api/sendImage');
  try {
    // check if sender is blocked by receiver
    const db = getDB();
    // get username form userVerify
    const qUsername = req.name;
    const qImageValue = req.body.image;
    // get current time
    const currentTime = Date.now();
    // generate a new post id
    let imageKey = null;
    if (qImageValue) {
      imageKey = `image-${qUsername}-${currentTime}`;
      // post image to s3
      const s3 = getS3();
      const bucketName = getBucketName();
      const s3Params = {
        Bucket: bucketName,
        Key: imageKey,
        Body: qImageValue,
      };
      // Uploading image to the bucket
      const s3Data = await s3.upload(s3Params).promise();
      console.log(s3Data.Location);
    }

    // send to wss to notify users
    const io = getWS();
    const sender = req.name;
    const receiver = req.body.to;
    const date = new Date();
    const dbMessage = {
      sender,
      receiver,
      timeStamp: date.getTime(),
      type: 'image',
      content: imageKey,
    };
    if (connectedUsers.has(receiver)) {
      const recvId = connectedUsers.get(receiver);
      io.to(recvId).emit('new message', dbMessage);
    }

    if (connectedUsers.has(sender)) {
      const sendId = connectedUsers.get(sender);
      io.to(sendId).emit('delivered message', dbMessage);
    }
    // store messages in DB
    // update sender's doc
    // message: [{ contact: contactName, messages: [ msg1, msg2, ... ] }]
    const senderDoc = await db.collection('Users').findOne({ username: sender });
    const senderMsgs = senderDoc.messages;
    const index1 = senderMsgs.findIndex((user) => user.contact === receiver);
    if (index1 === -1) { // no such user, first time to send msg
      senderMsgs.push({ contact: receiver, messages: [dbMessage] });
    } else {
      senderMsgs[index1].messages.push(dbMessage);
    }
    console.log(`Sender: ${sender} msg: ${senderMsgs}`);
    await db.collection('Users').updateOne(
      { username: sender },
      { $set: { messages: senderMsgs } },
    );
    // update receiver's doc
    const receiverDoc = await db.collection('Users').findOne({ username: req.body.to });
    const receiverMsgs = receiverDoc.messages;
    const index2 = receiverMsgs.findIndex((user) => user.contact === sender);
    if (index2 === -1) {
      receiverMsgs.push({ contact: sender, messages: [dbMessage] });
    } else {
      receiverMsgs[index2].messages.push(dbMessage);
    }
    console.log(`Receiver: ${receiver} msg: ${receiverMsgs}`);
    await db.collection('Users').updateOne(
      { username: receiver },
      { $set: { messages: receiverMsgs } },
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

let s3bucket;
if (process.env.NODE_ENV === 'test') {
  s3bucket = 'cis557sp21';
} else {
  s3bucket = process.env.S3BUCKET;
}

const upload = multer({
  storage: multerS3({
    s3: getS3(),
    bucket: s3bucket,
    key: (req, file, cb) => {
      cb(null, `audio-${Date.now().toString()}`);
    },
  }),
});

router.post('/sendAudio', userVerify, async (req, res) => {
  console.log('access /api/sendAudio');
  upload.single('audio')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ code: -1, msg: err.message, data: null });
    } else {
      console.log(req.file.location);
      try {
        const io = getWS();
        const sender = req.name;
        const receiver = req.body.to;
        const dbMessage = {
          sender,
          receiver,
          time: Date.now(),
          type: 'audio',
          content: req.file.location,
        };
        console.log(dbMessage);
        if (connectedUsers.has(receiver)) {
          const recvId = connectedUsers.get(receiver);
          io.to(recvId).emit('new message', dbMessage);
        }
        if (connectedUsers.has(sender)) {
          const sendId = connectedUsers.get(sender);
          io.to(sendId).emit('delivered message', dbMessage);
        }
        // store messages in DB
        const db = getDB();
        // update sender's doc
        // message: [{ contact: contactName, messages: [ msg1, msg2, ... ] }]
        const senderDoc = await db.collection('Users').findOne({ username: sender });
        const senderMsgs = senderDoc.messages;
        const index1 = senderMsgs.findIndex((user) => user.contact === receiver);
        if (index1 === -1) { // no such user, first time to send msg
          senderMsgs.push({ contact: receiver, messages: [dbMessage] });
        } else {
          senderMsgs[index1].messages.push(dbMessage);
        }
        console.log(`Sender: ${sender} msg: ${senderMsgs}`);
        await db.collection('Users').updateOne(
          { username: sender },
          { $set: { messages: senderMsgs } },
        );
        // update receiver's doc
        const receiverDoc = await db.collection('Users').findOne({ username: receiver });
        const receiverMsgs = receiverDoc.messages;
        const index2 = receiverMsgs.findIndex((user) => user.contact === sender);
        if (index2 === -1) {
          receiverMsgs.push({ contact: sender, messages: [dbMessage] });
        } else {
          receiverMsgs[index2].messages.push(dbMessage);
        }
        console.log(`Receiver: ${receiver} msg: ${receiverMsgs}`);
        await db.collection('Users').updateOne(
          { username: receiver },
          { $set: { messages: receiverMsgs } },
        );
        res.json({ code: 0, msg: 'Success', data: null });
      } catch (error) {
        res.status(400).json({ code: -1, msg: error.message, data: null });
      }
    }
  });
});

router.post('/getAudioValue', userVerify, async (req, res) => {
  console.log('access /api/getAudioValue');
  try {
    const s3 = getS3();
    const bucketName = getBucketName();
    const s3Params = {
      Bucket: bucketName,
      Key: req.body.audioKey,
    };
    s3.getObject(s3Params, (err, s3data) => {
      if (err) {
        res.status(400).json({ code: -1, msg: err.message, data: null });
        return;
      }
      // do something with the file
      if (s3data.Body === null) {
        res.status(400).json({ code: -1, msg: '[getImageValue] data.Body is null', data: s3data.Body });
        return;
      }
      // const str = s3data.Body.toString();
      // console.log(s3data.Body);
      // console.log(str);
      // Headers
      res.set('Content-Length', s3data.ContentLength).set('Content-Type', s3data.ContentType);
      // const fd = new FormData();
      // fd.append('audio', s3data.Body);
      res.status(200).send({ code: 0, msg: 'Success', data: s3data.Body });
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/isAbleToContact', userVerify, async (req, res) => {
  try {
    const db = getDB();
    const receiverDoc = await db.collection('Users').findOne({ username: req.body.to });
    if (receiverDoc.deactivated === true) {
      res.status(200).json({ code: 0, msg: `${req.body.to} has been deactivated.`, data: false });
    }
    if (receiverDoc.block.includes(req.name)) {
      res.status(200).json({ code: 0, msg: `You have been blocked by ${req.body.to}`, data: false });
    } else {
      res.status(200).json({ code: 0, msg: `You are not blocked by ${req.body.to}`, data: true });
    }
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

module.exports = router;
