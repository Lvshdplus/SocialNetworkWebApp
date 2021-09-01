import jwtDecode from 'jwt-decode';

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

const expressUrl = domain;
const tokenName = 'UserToken';

const getToken = () => {
  return sessionStorage.getItem(tokenName);
}

const setToken = (token) => {
  sessionStorage.setItem(tokenName, token);
}

const logOut = () => {
  sessionStorage.removeItem(tokenName);
  return true;
}

const getCurrentUser = () => {
  const token = getToken();
  if (token) {
    console.log(jwtDecode(token));
    return jwtDecode(token);
  }
  return null;
}

async function register(qUsername, qPassword, qSafeQuestion, qSafeAnswer) { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/register';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: qUsername, password: qPassword, safeQuestion: qSafeQuestion, safeAnswer: qSafeAnswer }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails: ${e}`);
  }
}

async function login(qUsername, qPassword) { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/login';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: qUsername, password: qPassword }),
    });
    const resJson = await res.json();
    if (resJson.code === 0) {
      setToken(resJson.data);
    }
    return resJson;
  } catch (e) {
    throw new Error(`fetch login fails: ${e}`);
  }
}

async function resetPasswordPage(qUsername, qPassword, qSafeQuestion, qSafeAnswer) { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/resetPasswordPage';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: qUsername, password: qPassword, safeQuestion: qSafeQuestion, safeAnswer: qSafeAnswer }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch resetPasswordPage fails: ${e}`);
  }
}

async function getProfile(qUsername) { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/getProfile';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: qUsername }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch getProfile fails: ${e}`);
  }
}

async function deactivateUser() { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/deactivateUser';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch deactivateUser fails: ${e}`);
  }
}

async function verify() { // eslint-disable-line consistent-return
  try {
    const url = expressUrl + '/api/verify';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + getToken()
      },
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch register fails: ${e}`);
  }
}

export {
  register,
  login,
  resetPasswordPage,
  getProfile,
  deactivateUser,
  verify,
  getToken,
  setToken,
  logOut,
  getCurrentUser
};