const twilio = require('twilio');
const AccessToken = twilio.jwt.AccessToken;
const { VideoGrant, ChatGrant } = AccessToken;

const generateToken = config => {
  return new AccessToken(
    config.twilio.accountSid,
    config.twilio.apiKey,
    config.twilio.apiSecret
  );
};

const videoToken = (identity, room, config) => {
  let videoGrant;
  if (typeof room !== 'undefined') {
    videoGrant = new VideoGrant({ room });
  } else {
    videoGrant = new VideoGrant();
  }
  const token = generateToken(config);
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};

const chatToken = (identity, config) => {
  const chatGrant = new ChatGrant({
    serviceSid: config.twilio.chatServiceSid,
  });
  const token = generateToken(config);
  token.addGrant(chatGrant);
  token.identity = identity;
  return token
}

module.exports = { videoToken, chatToken };
