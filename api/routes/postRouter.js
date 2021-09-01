/* eslint-disable no-console */
/* eslint-disable no-useless-return */
/* eslint-disable no-useless-catch */
/* eslint-disable no-continue */
/* eslint-disable max-len */
const express = require('express');
const { check, validationResult } = require('express-validator');
const {
  getDB, getS3, getBucketName, userVerify, connectedUsers, getWS,
} = require('../server');

const router = express.Router();

function comparePostByTime(a, b) {
  if (a.timeStamp > b.timeStamp) {
    return -1;
  }
  if (a.timeStamp < b.timeStamp) {
    return 1;
  }
  return 0;
}

router.post('/sendPost', userVerify, async (req, res) => {
  console.log('Access /api/sendPost api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qTextValue = req.body.textValue.trim();
    const qImageValue = req.body.imageValue;
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

    const db = getDB();
    const qPostId = `post-${qUsername}-${currentTime}`;
    // insert new post to db
    await db.collection('Posts').insertOne({
      postId: qPostId,
      author: qUsername,
      timeStamp: currentTime,
      content: {
        text: qTextValue,
        image: imageKey,
      },
      comments: [],
    });
    // add new postid to user
    await db.collection('Users').updateOne(
      { username: qUsername },
      { $push: { posts: { postId: qPostId } } },
    );

    if (process.env.NODE_ENV !== 'test') {
      // get all followers and notify them to update posts
      const io = getWS();
      const qMentions = req.body.mentions;
      console.log(qMentions);
      const senderDoc = await db.collection('Users').findOne({ username: req.name });
      const { followers } = senderDoc;
      for (let i = 0; i < followers.length; i += 1) {
        const follower = followers[i];
        if (connectedUsers.has(follower)) {
          const followerId = connectedUsers.get(follower);
          const index = qMentions.findIndex((user) => user === follower);
          // console.log('index: ', index);
          io.to(followerId).emit('new post', { sender: req.name, mentioned: index !== -1 });
        }
      }
    }

    res.status(200).json({ code: 0, msg: 'success', data: qPostId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/deletePost', userVerify, async (req, res) => {
  console.log('Access /api/deletePost api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qPostId = req.body.postId;
    const db = getDB();
    // delete from Posts
    const docFromPosts = await db.collection('Posts').deleteOne({ postId: qPostId });
    // delete from user posts
    const docFromUser = await db.collection('Users').updateOne({ username: qUsername }, { $pull: { posts: { postId: qPostId } } });
    if (process.env.NODE_ENV !== 'test') {
      // get all followers and notify them to update posts
      const io = getWS();
      const senderDoc = await db.collection('Users').findOne({ username: req.name });
      const { followers } = senderDoc;
      for (let i = 0; i < followers.length; i += 1) {
        const follower = followers[i];
        if (connectedUsers.has(follower)) {
          const followerId = connectedUsers.get(follower);
          io.to(followerId).emit('delete post');
        }
      }
    }
    res.status(200).json({ code: 0, msg: 'success', data: qPostId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/hidePost', userVerify, async (req, res) => {
  console.log('Access /api/hidePost api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qPostId = req.body.postId;
    const db = getDB();
    // add to user hiddenPosts
    // delete from user posts
    await db.collection('Users').updateOne(
      { username: qUsername },
      { $push: { hiddenPosts: qPostId } },
    );
    res.status(200).json({ code: 0, msg: 'success', data: qPostId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/getPostById', userVerify, async (req, res) => {
  console.log('Access /api/getPostById api');
  try {
    // get username form userVerify
    const qPostId = req.body.postId;
    const db = getDB();
    const post = await db.collection('Posts').findOne({
      postId: qPostId,
    });
    if (post) {
      res.status(200).json({ code: 0, msg: 'Success', data: post });
    } else {
      res.status(200).json({ code: -1, msg: '[getPostById] post not found!', data: null });
    }
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

// get all posts to show in main page
router.get('/getAllPosts', userVerify, async (req, res) => {
  console.log('Access /api/getAllPosts api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const db = getDB();
    const user = await db.collection('Users').findOne({
      username: qUsername,
    });
    const hiddenPostsList = user.hiddenPosts;
    const userList = [qUsername, ...user.followees];
    let postIdList = [];
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < userList.length; i += 1) {
      const contact = await db.collection('Users').findOne({
        username: userList[i],
      });
      postIdList = [...postIdList, ...contact.posts];
    }

    let postList = [];
    for (let i = 0; i < postIdList.length; i += 1) {
      // check if postId is in hiddenPosts
      if (hiddenPostsList.includes(postIdList[i].postId)) {
        continue;
      }
      const post = await db.collection('Posts').findOne({
        postId: postIdList[i].postId,
      });
      postList = [...postList, post];
    }
    postList.sort(comparePostByTime);
    res.status(200).json({ code: 0, msg: 'Success', data: postList });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

// get image value from s3 by imageId
router.post('/getImageValue', userVerify, async (req, res) => {
  console.log('Access /api/getImageValue api');
  try {
    // get image from s3
    const s3 = getS3();
    const bucketName = getBucketName();
    const s3Params = {
      Bucket: bucketName,
      Key: req.body.imageKey,
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
      const str = s3data.Body.toString();
      res.status(200).json({ code: 0, msg: 'Success', data: str });
    });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/sendComment', userVerify, async (req, res) => {
  console.log('Access /api/sendComment api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qPostId = req.body.postId;
    const qCommentValue = req.body.commentValue.trim();
    // get current time
    const currentTime = Date.now();

    const db = getDB();
    const qCommentId = `${qPostId}-comment-${qUsername}-${currentTime}`;
    // insert comment to db
    await db.collection('Posts').updateOne(
      { postId: qPostId },
      {
        $push:
        {
          comments:
          {
            $each: [{ commentId: qCommentId, commentAuthor: qUsername, commentValue: qCommentValue }],
            $position: 0,
          },
        },
      }, // eslint-disable-line max-len
    );

    // get all followers and notify them to update posts
    if (process.env.NODE_ENV !== 'test') {
      const io = getWS();
      const qMentions = req.body.mentions;
      console.log(qMentions);
      const PostOwner = qPostId.split('-')[1];
      console.log(PostOwner);
      const PostOwnerDoc = await db.collection('Users').findOne({ username: PostOwner });
      const { followers } = PostOwnerDoc;
      if (PostOwner !== req.name) {
        if (connectedUsers.has(req.name)) {
          const Id = connectedUsers.get(PostOwner);
          const index = qMentions.findIndex((user) => user === PostOwner);
          io.to(Id).emit('new comment', { sender: req.name, mentioned: index !== -1, postId: qPostId });
        }
      }
      for (let i = 0; i < followers.length; i += 1) {
        const follower = followers[i];
        if (connectedUsers.has(follower)) {
          const followerId = connectedUsers.get(follower);
          const index = qMentions.findIndex((user) => user === follower);
          io.to(followerId).emit('new comment', { sender: req.name, mentioned: index !== -1, postId: qPostId });
        }
      }
    }

    res.status(200).json({ code: 0, msg: 'success', data: qCommentId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/updateComment', userVerify, async (req, res) => {
  console.log('Access /api/updateComment api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qPostId = req.body.postId;
    const qCommentId = req.body.commentId;
    const qCommentValue = req.body.commentValue.trim();
    // get current time
    const db = getDB();
    // insert comment to db
    const doc = await db.collection('Posts').findOneAndUpdate(
      { postId: qPostId, 'comments.commentId': qCommentId },
      { $set: { 'comments.$.commentValue': qCommentValue } }, // eslint-disable-line max-len
    );

    // get all followers and notify them to update posts
    if (process.env.NODE_ENV !== 'test') {
      const io = getWS();
      const qMentions = req.body.mentions;
      console.log(qMentions);
      const PostOwner = qPostId.split('-')[1];
      console.log(PostOwner);
      const PostOwnerDoc = await db.collection('Users').findOne({ username: PostOwner });
      const { followers } = PostOwnerDoc;
      if (PostOwner !== req.name) {
        if (connectedUsers.has(req.name)) {
          const Id = connectedUsers.get(PostOwner);
          const index = qMentions.findIndex((user) => user === PostOwner);
          io.to(Id).emit('new comment', { sender: req.name, mentioned: index !== -1, postId: qPostId });
        }
      }
      for (let i = 0; i < followers.length; i += 1) {
        const follower = followers[i];
        if (connectedUsers.has(follower)) {
          const followerId = connectedUsers.get(follower);
          const index = qMentions.findIndex((user) => user === follower);
          io.to(followerId).emit('new comment', { sender: req.name, mentioned: index !== -1, postId: qPostId });
        }
      }
    }

    res.status(200).json({ code: 0, msg: 'success', data: qCommentId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

router.post('/deleteComment', userVerify, async (req, res) => {
  console.log('Access /api/deleteComment api');
  try {
    // get username form userVerify
    const qUsername = req.name;
    const qPostId = req.body.postId;
    const qCommentId = req.body.commentId;
    // get current time
    const db = getDB();
    // insert comment to db
    const doc = await db.collection('Posts').update(
      { postId: qPostId },
      { $pull: { comments: { commentId: qCommentId } } }, // eslint-disable-line max-len
    );

    if (process.env.NODE_ENV !== 'test') {
      const PostOwner = qPostId.split('-')[1];
      console.log(PostOwner);
      // get all followers and notify them to update posts
      const io = getWS();
      const PostOwnerDoc = await db.collection('Users').findOne({ username: PostOwner });
      const { followers } = PostOwnerDoc;
      if (PostOwner !== req.name) {
        if (connectedUsers.has(req.name)) {
          const Id = connectedUsers.get(PostOwner);
          io.to(Id).emit('new comment', { sender: req.name, mentioned: false, postId: qPostId });
        }
      }
      for (let i = 0; i < followers.length; i += 1) {
        const follower = followers[i];
        if (connectedUsers.has(follower)) {
          const followerId = connectedUsers.get(follower);
          io.to(followerId).emit('new comment', { sender: req.name, mentioned: false, postId: qPostId });
        }
      }
    }

    res.status(200).json({ code: 0, msg: 'success', data: qCommentId });
  } catch (error) {
    res.status(400).json({ code: -1, msg: error.message, data: null });
  }
});

module.exports = router;
