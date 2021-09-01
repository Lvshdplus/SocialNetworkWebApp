import { getToken } from './authFetch';

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';


async function sendMsg(to, msg) {
  console.log('to: ', to);
  try {
    const url = domain + '/api/sendMsg';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ to, msg })
    });
    const resJson = await res.json();
    console.log(resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails: ${e}`);
  }
}

async function getMsg() {
  try {
    const url = domain + '/api/getMsg';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      }
    });
    const resJson = await res.json();
    console.log('resJson: ', resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails: ${e}`);
  }
}

async function sendImgMsg(to, image) {
  try {
    const url = domain + '/api/sendImage';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ to, image })
    });
    const resJson = await res.json();
    console.log('resJson: ', resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails`);
  }
} 

async function sendAudioMsg(to, blob) {
  const fd = new FormData();
  fd.append('to', to);
  fd.append('audio', blob, 'audio.wav') ;
  try {
    const url = domain + '/api/sendAudio';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'enctype': 'multipart/formdata',
        'Authorization': 'Bearer ' + getToken()
      },
      body: fd
    });
    const resJson = await res.json();
    console.log('resJson: ', resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails`);
  }
} 

async function getAudioValue(audioLoc) {
  const splitUrl = audioLoc.split('/');
  const key = splitUrl.pop();
  console.log(key);
  try {
    const url = domain + '/api/getAudioValue';
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ audioKey: key }),
    })
    const resJson = await res.json();
    // console.log('resJson: ', resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch getAudioValue fails: ${e}`);
  }
}

async function isAbleToContact(user) {
  try {
    const url = domain + '/api/isAbleToContact';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({to: user}),
    });
    const resJson = await res.json();
    console.log('resJson: ', resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails: ${e}`);
  }
}

export { sendMsg, getMsg, sendImgMsg, sendAudioMsg, getAudioValue, isAbleToContact };
