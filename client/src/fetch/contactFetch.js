import { getToken } from './authFetch';

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

async function searchNewUserSingle(name) {
  try {
    const url = domain + '/api/searchNewUserSingle';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: name })
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch searchNewUserSingle fails: ${e}`);
  }
};

/**
 * read first 10 users
 */
async function searchNewUser(name) {
  try {
    const url = domain + '/api/searchNewUser';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: name })
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch searchNewUser fails: ${e}`);
  }
};

async function followUser(name) {
  try {
    const url = domain + '/api/follow';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: name })
    });
    const resJson = await res.json();
    // console.log(resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch followUser fails: ${e}`);
  }
}

async function unfollowUser(qUsername, qUnfollowedUser) {
  try {
    const url = domain + '/api/unfollow';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ username: qUsername, unfollowedUser: qUnfollowedUser })
    });
    const resJson = await res.json();
    // console.log(resJson);
    return resJson;
  } catch (e) {
    throw new Error(`fetch unfollowUser fails: ${e}`);
  }
}

async function getAllContacts() {
  try {
    const url = domain + '/api/getAllContacts';
    const res = await fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      }
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch getAllContacts fails: ${e}`);
  }
};

async function getContactEntries(qContacts) {
  try {
    const url = domain + '/api/getContactEntries';
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
    throw new Error(`fetch getContactEntries fails: ${e}`);
  }
};

async function blockUser(name) {
  try {
    const url = domain + '/api/blockUser';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ blockedUser: name })
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch blockUser fails: ${e}`);
  }
}

async function unblockUser(name) {
  try {
    const url = domain + '/api/unblockUser';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ blockedUser: name })
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch unblockUser fails: ${e}`);
  }
}

export { 
  searchNewUser,
  searchNewUserSingle,
  followUser,
  unfollowUser,
  getAllContacts,
  getContactEntries,
  blockUser,
  unblockUser
};