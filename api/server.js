/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
// configure enviroments
require('dotenv').config();
// Create express app
const express = require('express');
// Cross-origin resource sharing https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
const cors = require('cors');
// security feature. JSON web token - https://jwt.io
const jwt = require('jsonwebtoken');
// Help with parsing body of HTTP requests
const bodyParser = require('body-parser');
// Import MongoDB module
const { MongoClient } = require('mongodb');
// Import AWS S3
const AWS = require('aws-sdk');
// Twilio API
const config = require('./config');
const pino = require('express-pino-logger')();

const { check, validationResult } = require('express-validator');

const path = require('path');

const clientIO = require('socket.io-client');
// const { getWSS } = require('./wsserver');

// const WSS = getWSS();

/*
 * init express
 */
const webapp = express();

const server = require('http').Server(webapp);

const jwtsecret = process.env.NODE_ENV === 'test'
  ? 'This is a key'
  : process.env.JWTSECRET;

const io = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })
  : require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

// -----------------[Socket]----------------------------
// Map of connected clients (user - client id) pairs
const connectedUsers = new Map();

// connection event
io.on('connection', (socket) => {
  const { token } = socket.handshake.headers;
  let client = '';
  jwt.verify(token, jwtsecret, (err, decoded) => {
    if (err) {
      // If error send Forbidden (403)
      console.log('[SocketIO] fail to verify jwt');
    } else {
      // If token is successfully verified, we can send the autorized data
      client = decoded.name;
      console.log(`[SocketIO] New connection from user ${client} with id: ${socket.id}`);
      connectedUsers.set(client, socket.id);
    }
  });
  socket.on('disconnect', () => {
    console.log(`[SocketIO]${client} disconnected with id: ${socket.id}.`);
    connectedUsers.delete(client);
  });
});

// ------------------------------------------------------

webapp.use(cors());

webapp.use(bodyParser.json({ limit: '10mb', extended: true }));

webapp.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

webapp.use(express.static(path.join(__dirname, '../client/build')));

// webapp.use(bodyParser.urlencoded({ extended: false }));
// webapp.use(bodyParser.json());
// webapp.use(pino);

/*
 * init database
 */
let url;

if (process.env.NODE_ENV === 'development') {
  url = process.env.LOCAL_DB_URL;
} else if (process.env.NODE_ENV === 'test') {
  url = 'mongodb+srv://team14:cis557@cluster0.tzp9j.mongodb.net/Webapp?retryWrites=true&w=majority';
} else {
  url = process.env.DB_URL;
}

// url = process.env.LOCAL_DB_URL;

/*
 * init AWS S3
 */

// The name of the bucket that you have created
let BUCKET_NAME;
let s3;
if (process.env.NODE_ENV === 'test') {
  BUCKET_NAME = 'cis557sp21';
  s3 = new AWS.S3({
    accessKeyId: 'AKIAYBMP5SVIPUUEM7MD',
    secretAccessKey: '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',
  });
} else {
  BUCKET_NAME = process.env.S3BUCKET;
  s3 = new AWS.S3({
    accessKeyId: process.env.S3ID,
    secretAccessKey: process.env.S3SECRET,
  });
}

const getS3 = () => s3;
const getBucketName = () => BUCKET_NAME;

// JSON web token creation
const serverToken = jwt.sign({
  name: 'webserver',
}, jwtsecret, { expiresIn: 60 * 60 * 24 });

// const connection = ioClient('http:localhost');

const getWS = () => io;

// client-side
// connection.on('connect', () => {
//   connection.emit('hello', { name: 'John' });
//   console.log(connection.id); // x8WIv7-mJelg7on_ALbx
// });

// Connect to db
const connect = async () => {
  try {
    console.log(`connect to db url ${url}`);
    const tmp = (await MongoClient.connect(url,
      { useNewUrlParser: true, useUnifiedTopology: true })).db();
    // Connected to db
    console.log(`Connected to database: ${tmp.databaseName}`);
    return tmp;
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

/*
 * start express server
 */
let db;
const port = process.env.PORT || 5000;
server.listen(port, async () => {
  db = await connect();
  console.log(`--Server running on port:${port}`);
});

const getDB = () => db;

webapp.get('/api/', (req, res) => {
  res.json({ message: 'Welcome to HW4 Backend' });
});

/*
 * verification with jwt
 */
const userVerify = (req, res, next) => {
  const header = req.headers.authorization;
  // console.log(`token received: ${header}`);
  if (typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];
    jwt.verify(token, jwtsecret, (err, decoded) => {
      if (err) {
        // If error send Forbidden (403)
        console.log('ERROR: Could not connect to the protected route');
        res.sendStatus(403);
      } else {
        // If token is successfully verified, we can send the autorized data
        req.name = decoded.name;
        next();
      }
    });
  } else {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
};

module.exports = {
  connectedUsers,
  webapp,
  server,
  getDB,
  getWS,
  getS3,
  getBucketName,
  userVerify,
};

webapp.use('/api', require('./routes/authRouter'));
webapp.use('/api', require('./routes/contactRouter'));
webapp.use('/api', require('./routes/postRouter'));
webapp.use('/api', require('./routes/messageRouter'));
webapp.use('/api', require('./routes/streamRouter'));

// Root endpoint
webapp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
