import { getToken } from './authFetch';

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

async function generateVideoToken(username, roomname) {
  try {
    const url = domain + '/api/video/token';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identity: username,
        room: roomname,
      })
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch twilio video token fails: ${e}`)
  }
};

async function generateChatToken(username, roomname) {
  try {
    const url = domain + '/api/chat/token';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        identity: username,
      })
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch twilio chat token fails: ${e}`)
  }
};

async function startLive(name, owner) {
  try {
    const url = domain + '/api/video/start';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ 
        username: name, 
        owner: owner, 
      })
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch start live fails: ${e}`);
  }
};

async function endLive(name) {
  try {
    const url = domain + '/api/video/end';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: name })
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch end live fails: ${e}`);
  }
};

async function getLives(name) {
  try {
    const url = domain + '/api/video/list';
    const res = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch live lists fails: ${e}`);
  }
}

export { getLives, generateVideoToken, generateChatToken, startLive, endLive };
