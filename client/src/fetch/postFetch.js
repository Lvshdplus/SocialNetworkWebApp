import { getToken } from './authFetch';

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

const expressUrl = domain;

async function sendPost(qTextValue, qImageValue, qMentions) { // eslint-disable-line consistent-return
  // console.log(`[postfetch]: ${qTextValue}`);
  // console.log(`[postfetch]: ${qImageValue}`);
  // console.log(`[postfetch]: ${qMentions}`);
  try {
    const url = expressUrl + '/api/sendPost';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ textValue: qTextValue, imageValue: qImageValue, mentions: qMentions}),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch sendPost fails: ${e}`);
  }
}

async function deletePost(qPostId) {
  try {
    const url = expressUrl + '/api/deletePost';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch deletePost fails: ${e}`);
  }
}

async function hidePost(qPostId) {
  try {
    const url = expressUrl + '/api/hidePost';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch hidePost fails: ${e}`);
  }
}

// async function getPostsOfUser(qContactName) {
//   try {
//     const url = domain + '/api/getPostsOfUser';
//     const res = await fetch(url, {
//       method: "POST",
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + getToken()
//       },
//       body: JSON.stringify({ contactName: qContactName }),
//     })
//     const resJson = await res.json();
//     return resJson;
//   } catch (e) {
//     throw new Error(`getPostsOfUser fails: ${e}`);
//   }
// };

async function getPostById(qPostId) {
  try {
    const url = domain + '/api/getPostById';
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId }),
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch getPostById fails: ${e}`);
  }
};

async function getAllPosts() {
  try {
    const url = domain + '/api/getAllPosts';
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
    throw new Error(`fetch getAllPosts fails: ${e}`);
  }
};

async function getImageValue(qImageKey) {
  try {
    const url = domain + '/api/getImageValue';
    const res = await fetch(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ imageKey: qImageKey }),
    })
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch getImageValue fails: ${e}`);
  }
};

async function sendComment(qPostId, qCommentValue, qMentions) {
  try {
    const url = expressUrl + '/api/sendComment';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId, commentValue: qCommentValue, mentions: qMentions }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch sendComment fails: ${e}`);
  }
}

async function updateComment(qPostId, qCommentId, qCommentValue, qMentions) {
  try {
    const url = expressUrl + '/api/updateComment';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId, commentId: qCommentId, commentValue: qCommentValue, mentions: qMentions }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch updateComment fails: ${e}`);
  }
}

async function deleteComment(qPostId, qCommentId) {
  try {
    const url = expressUrl + '/api/deleteComment';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify({ postId: qPostId, commentId: qCommentId }),
    });
    const resJson = await res.json();
    return resJson;
  } catch (e) {
    throw new Error(`fetch deleteComment fails: ${e}`);
  }
}

export {
  sendPost,
  deletePost,
  hidePost,
  // getPostsOfUser,
  getPostById,
  getAllPosts,
  getImageValue,
  sendComment,
  updateComment,
  deleteComment,
};