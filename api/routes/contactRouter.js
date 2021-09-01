/* eslint-disable no-console */
/* eslint-disable no-useless-return */
/* eslint-disable no-useless-catch */
/* eslint-disable no-await-in-loop */
const express = require('express');
// const { check, validationResult } = require('express-validator');
// const jwt = require('jsonwebtoken');
const { getDB, userVerify } = require('../server');

const router = express.Router();

router.post('/searchNewUserSingle', userVerify, async (req, res) => {
  console.log('Access /api/searchNewUserSingle');
  console.log(`${req.name} querries ${req.body.username}`);
  if (!req.body.username) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const qUsername = req.body.username.trim();
    const db = getDB();
    const newUserDoc = await db.collection('Users').findOne({
      username: qUsername,
    });
    if (newUserDoc !== null && !newUserDoc.deactivated) {
      const userDoc = await db.collection('Users').findOne({ username: req.name });
      const followed = userDoc.followees.includes(qUsername);
      const blocked = userDoc.block.includes(qUsername);
      // [TBD] add avatar
      res.status(200).json({ code: 0, msg: 'Success', data: { isFollowed: followed, isBlocked: blocked } });
    } else {
      res.status(201).json({ code: 1, msg: 'searchNewUserSingle No such user', data: null });
    }
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/searchNewUser', userVerify, async (req, res) => {
  console.log('Access /api/searchNewUser api');
  console.log(`${req.name} querries ${req.body.username}`);
  if (!req.body.username) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const target = req.body.username;
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: req.name });

    const candidates = await db.collection('Users').find({
      $or: [
        { username: target },
        { $and: [{ username: { $regex: `.*${target}.*` } }, { 'followers.2': { $exists: true } }, { username: { $not: { $regex: `${req.name}` } } }] },
      ],
    }).sort({ username: 1 }).toArray();
    let candidateEntryList = [];
    for (let i = 0; i < candidates.length; i += 1) {
      // check if postId is in hiddenPosts
      const qContactName = candidates[i].username;
      const followed = userDoc.followees.includes(qContactName);
      const blocked = userDoc.block.includes(qContactName);
      const contactEntry = { contact: qContactName, isFollowed: followed, isBlocked: blocked };
      candidateEntryList = [...candidateEntryList, contactEntry];
    }
    res.status(200).json({ code: 0, msg: 'Success', data: candidateEntryList });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/follow', userVerify, async (req, res) => {
  console.log('Accessing /api/follow');
  console.log(`${req.name} follows ${req.body.username}`);
  if (!req.body.username) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const qUsername = req.body.username;
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: req.name });
    const userToFollowDoc = await db.collection('Users').findOne({ username: qUsername });
    if (userToFollowDoc.block.includes(req.name)) {
      res.status(403).json({ code: -1, msg: `You have been blocked by ${qUsername}`, data: null });
      return;
    }
    const userFollowees = userDoc.followees;
    const userToFollowFollowers = userToFollowDoc.followers;
    userFollowees.push(qUsername);
    userToFollowFollowers.push(req.name);
    const updateUserRes = await db.collection('Users').updateOne(
      { username: req.name },
      { $set: { followees: userFollowees } },
    );
    // console.log(updateUserRes);
    const updateUserToFollow = await db.collection('Users').updateOne(
      { username: qUsername },
      { $set: { followers: userToFollowFollowers } },
    );
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/unfollow', userVerify, async (req, res) => {
  console.log('Accessing /api/unfollow');
  console.log(`${req.name} unfollows ${req.body.username}`);
  if (!req.body.username) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const qUsername = req.body.username;
    const qUnfollowedUser = req.body.unfollowedUser;
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: qUsername });
    const userToFollowDoc = await db.collection('Users').findOne({ username: qUnfollowedUser });
    const userFollowees = userDoc.followees.filter((user) => user !== qUnfollowedUser);
    const userToFollowFollowers = userToFollowDoc.followers.filter((user) => user !== qUsername);
    const updateUserRes = await db.collection('Users').updateOne(
      { username: qUsername },
      { $set: { followees: userFollowees } },
    );
    // console.log(updateUserRes);
    const updateUserToFollow = await db.collection('Users').updateOne(
      { username: qUnfollowedUser },
      { $set: { followers: userToFollowFollowers } },
    );
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.get('/getAllContacts', userVerify, async (req, res) => {
  try {
    const db = getDB();
    const contacts = await db.collection('Users').findOne({
      username: req.name,
    });
    if (contacts) {
      res.status(200).json({ code: 0, msg: 'Success', data: contacts.followees });
    } else {
      res.status(200).json({ code: 1, msg: 'User not exists!', data: null });
    }
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.get('/getContactEntries', userVerify, async (req, res) => {
  console.log('Access /api/getContactEntries api');
  try {
    const db = getDB();
    const userDoc = await db.collection('Users').findOne({ username: req.name });
    const contacts = userDoc.followees;
    contacts.sort();
    let contactEntryList = [];
    for (let i = 0; i < contacts.length; i += 1) {
      // check if postId is in hiddenPosts
      const qContactName = contacts[i];
      const followed = userDoc.followees.includes(qContactName);
      const blocked = userDoc.block.includes(qContactName);
      const contactEntry = { contact: qContactName, isFollowed: followed, isBlocked: blocked };
      contactEntryList = [...contactEntryList, contactEntry];
    }
    res.status(200).json({ code: 0, msg: 'Success', data: contactEntryList });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/blockUser', userVerify, async (req, res) => {
  console.log('Accessing /api/blockUser');
  console.log(`${req.name} blocks ${req.body.blockedUser}`);
  if (!req.body.blockedUser) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const qBlockedUser = req.body.blockedUser;
    const db = getDB();
    await db.collection('Users').updateOne(
      { username: req.name },
      { $push: { block: qBlockedUser } },
    );
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/unblockUser', userVerify, async (req, res) => {
  console.log('Accessing /api/blockUser');
  console.log(`${req.name} unblocks ${req.body.blockedUser}`);
  if (!req.body.blockedUser) {
    res.status(403).json({ code: -1, msg: 'Missing username', data: null });
    return;
  }
  try {
    const qBlockedUser = req.body.blockedUser;
    const db = getDB();
    await db.collection('Users').updateOne({ username: req.name }, { $pull: { block: { $in: [qBlockedUser] } } });
    res.status(200).json({ code: 0, msg: 'Success', data: null });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

module.exports = router;
