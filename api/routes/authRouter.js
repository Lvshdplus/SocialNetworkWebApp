/* eslint-disable no-console */
/* eslint-disable no-useless-return */
/* eslint-disable no-useless-catch */
/* eslint-disable no-await-in-loop */
const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const { getDB, userVerify } = require('../server');

const router = express.Router();

const jwtsecret = process.env.NODE_ENV === 'test'
  ? 'This is a key'
  : process.env.JWTSECRET;

router.post('/test', (req, res) => {
  res.status(200).json({ code: 0, msg: 'test', data: null });
  return;
});

router.post('/register', [
  check('username').trim().isLength({ min: 3, max: 12 }).withMessage('username length should be between 3 and 10'),
  check('password').trim().isLength({ min: 3, max: 32 }).withMessage('password length should be between 3 and 32'),
], async (req, res) => {
  console.log('Access /register api');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(403).json({ code: -1, msg: errors.array()[0].msg, data: null });
    return;
  }
  try {
    // query username and password
    const qUsername = req.body.username.trim();
    const qPassword = req.body.password.trim();
    const qProfileId = `profile-${qUsername}`;
    const qSafeQuestion = req.body.safeQuestion;
    const qSafeAnswer = req.body.safeAnswer;
    const qCurrentTime = Date.now();
    const db = getDB();
    // check if the user has been registered
    const docExist = await db.collection('Users').findOne({
      username: qUsername,
    });
    // username has been registered
    if (docExist !== null) {
      res.status(409).json({ code: -1, msg: ` Username has already been registered: ${qUsername}`, data: null });
      return;
    }
    // insert to profiles
    const docProfile = await db.collection('Profiles').insertOne({
      profileId: qProfileId,
      registrationDate: qCurrentTime,
      safeQuestion: qSafeQuestion,
      safeAnswer: qSafeAnswer,
      avatar: null,
    });

    bcrypt.hash(qPassword, saltRounds, async (err, hashedPassword) => {
      // Store hash in your password DB.
      if (err) {
        res.status(409).json({ code: -1, msg: err.msg, data: null });
        return;
      }
      // username can be registered
      const docUser = await db.collection('Users').insertOne({
        username: qUsername,
        password: hashedPassword,
        profileId: qProfileId,
        posts: [],
        followers: [],
        followees: [],
        block: [],
        hiddenPosts: [],
        lockout: {
          lockCount: 0,
          locked: false,
          lockTime: qCurrentTime,
        },
        messages: [],
        deactivated: false,
        live: "",
      });
      res.status(200).json({ code: 0, msg: 'New account registered successfully', data: docUser });
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/login', [
  check('username').trim().isLength({ min: 3, max: 12 }).withMessage('username length should be between 3 and 10'),
  check('password').trim().isLength({ min: 3, max: 32 }).withMessage('password length should be between 3 and 32'),
], async (req, res) => {
  console.log('Access /api/login api');
  console.log(`name: ${req.body.username.trim()} password: ${req.body.password.trim()}`);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(403).json({ code: -1, msg: errors.array()[0].msg, data: null });
    return;
  }
  try {
    // query username and password
    const qUsername = req.body.username.trim();
    const qPassword = req.body.password.trim();
    const db = getDB();
    // check if the user is in database
    const doc = await db.collection('Users').findOne({
      username: qUsername,
    });
    // username has not been registered
    if (doc === null) {
      res.status(404).json({ code: -1, msg: ` User does not exist: ${qUsername}`, data: null });
      return;
    }
    // check if the account has been deactivated
    if (doc.deactivated) {
      res.status(403).json({ code: -1, msg: `Account has been deactivated: ${qUsername}`, data: null });
      return;
    }
    // check if user is locked, unable to login within 30 minutes
    if (doc.lockout.locked) {
      const timeInvertal = Math.floor(((Date.now() - doc.lockout.lockTime) / 1000) / 60);
      if (timeInvertal < 30) {
        res.status(403).json({ code: -1, msg: `Account has been locked, please try later: ${qUsername}`, data: null });
        return;
      }
    }
    // Load hash from your password DB to check if password matches:
    bcrypt.compare(qPassword, doc.password, async (err, valid) => {
      if (!valid) {
        // not match, update lock
        const lockCount = doc.lockout.lockCount + 1;
        const locked = (lockCount === 3);
        await db.collection('Users').updateOne(
          { username: qUsername },
          { $set: { 'lockout.lockCount': lockCount, 'lockout.locked': locked, 'lockout.lockTime': Date.now() } },
        );
        res.status(403).json({ code: -1, msg: 'Password is incorrect, please try again.', data: null });
        return;
      }
      // correct, can login
      // update lockout
      await db.collection('Users').updateOne(
        { username: qUsername },
        { $set: { 'lockout.lockCount': 0, 'lockout.locked': false, 'lockout.lockTime': Date.now() } },
      );
      const jwtToken = jwt.sign({
        name: qUsername,
      }, jwtsecret, { expiresIn: 60 * 60 * 24 });
      // notify ws server a new user comes
      res.json({ code: 0, msg: 'Success', data: jwtToken });
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/resetPasswordPage', [
  check('username').trim().isLength({ min: 3, max: 12 }).withMessage('username length should be between 3 and 10'),
  check('password').trim().isLength({ min: 3, max: 32 }).withMessage('password length should be between 3 and 32'),
], async (req, res) => {
  console.log('Access /resetPasswordPage api');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(403).json({ code: -1, msg: errors.array()[0].msg, data: null });
    return;
  }
  try {
    // query username and password
    const qUsername = req.body.username.trim();
    const qPassword = req.body.password.trim();
    const qProfileId = `profile-${qUsername}`;
    const qSafeQuestion = req.body.safeQuestion;
    const qSafeAnswer = req.body.safeAnswer;
    const db = getDB();
    // check if the user has been registered
    const docExist = await db.collection('Users').findOne({
      username: qUsername,
    });
    // user not exist
    if (docExist === null) {
      res.status(404).json({ code: -1, msg: ` User does not exist: ${qUsername}`, data: null });
      return;
    }
    // get profiles
    const docProfile = await db.collection('Profiles').findOne({
      profileId: qProfileId,
    });
    // check if safe question and safe answer matches
    if (qSafeQuestion !== docProfile.safeQuestion || qSafeAnswer !== docProfile.safeAnswer) {
      res.status(400).json({ code: -1, msg: 'Safe question validation fails', data: null });
      return;
    }
    // first hash and then update password
    bcrypt.hash(qPassword, saltRounds, async (err, hashedPassword) => {
      // Store hash in your password DB.
      await db.collection('Users').updateOne(
        { username: qUsername },
        { $set: { password: hashedPassword } },
      );
      res.status(200).json({ code: 0, msg: 'Reset password successfully', data: qUsername });
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/getProfile', userVerify, async (req, res) => {
  console.log('Access /api/getProfile api');
  try {
    // query username and password
    const qUsername = req.body.username.trim();
    const qProfileId = `profile-${qUsername}`;
    const db = getDB();
    // get profiles
    const docProfile = await db.collection('Profiles').findOne({
      profileId: qProfileId,
    });
    res.status(200).json({ code: 0, msg: 'getProfile successfully', data: docProfile });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.get('/deactivateUser', userVerify, async (req, res) => {
  console.log('Access /api/deactivateUser api');
  try {
    // query username and password
    const qUsername = req.name;
    const db = getDB();
    // get profiles
    const docDeactivated = await db.collection('Users').updateOne(
      { username: qUsername },
      { $set: { deactivated: true } },
    );
    // update the user's follower: remove this user from follower's followee list
    const docUser = await db.collection('Users').findOne({
      username: qUsername,
    });
    for (let i = 0; i < docUser.followers.length; i += 1) {
      const follower = docUser.followers[i];
      const followerDoc = await db.collection('Users').updateOne({ username: follower }, { $pull: { followees: { $in: [qUsername] } } });
    }
    // update followees: remove this user from followee's follower list
    for (let i = 0; i < docUser.followees.length; i += 1) {
      const followee = docUser.followees[i];
      const followeeDoc = await db.collection('Users').updateOne({ username: followee }, { $pull: { followers: { $in: [qUsername] } } });
    }
    // clear messages
    for (let i = 0; i < docUser.messages.length; i += 1) {
      const { contact } = docUser.messages[i];
      const contactDoc = await db.collection('Users').updateOne({ username: contact }, { $pull: { messages: { contact: qUsername } } });
    }
    // clear user's follower and followee list
    const docClear = await db.collection('Users').updateOne(
      { username: qUsername },
      { $set: { followers: [], followees: [], messages: [] } },
    );
    res.status(200).json({ code: 0, msg: 'Reset password successfully', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.delete('/deleteUser', userVerify, async (req, res) => {
  console.log('Access /deleteUser api');
  try {
    // query username and password
    const qUsername = req.body.username.trim();
    const db = getDB();
    const doc = await db.collection('Users').deleteOne({ username: qUsername });
    res.status(200).json({ code: 0, msg: 'Success', data: doc });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.delete('/deleteProfile', userVerify, async (req, res) => {
  console.log('Access /deleteProfile api');
  try {
    // query username and password
    const qProfileId = req.body.profileId;
    const db = getDB();
    const doc = await db.collection('Profiles').deleteOne({ profileId: qProfileId });
    res.status(200).json({ code: 0, msg: 'Success', data: doc });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.get('/verify', userVerify, (req, res) => {
  res.json({ code: 0, msg: `${req.name} has already been authenticated!`, data: req.name });
});

module.exports = router;
