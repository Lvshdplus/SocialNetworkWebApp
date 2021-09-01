import { combineReducers } from 'redux';

const messageRawData = (state = [], action) => {
  const newState = [...state];
  if (action.type === 'recvMsgByOne') {
    console.log('[Reducer]recvMsgByOne');
    // [case1] websocket receives a new message notification
    // action.data: { sender, receiver, timeStamp, type, content }
    const index = newState.findIndex((user) => user.contact === action.data.sender);
    if (index === -1) {
      newState.push({ contact: action.data.sender, messages: [action.data]});
      return newState;
    } else {
      newState[index].messages.push(action.data);
      return newState;
    }
  }
  if (action.type === 'sendMsgByOne') {
    console.log('[Reducer]sendMsgByOne');
    // [case2] websocket receives a delivered message notification
    // action.data: { sender, receiver, timeStamp, type, content }
    const index = newState.findIndex((user) => user.contact === action.data.receiver);
    if (index === -1) {
      newState.push({ contact: action.data.receiver, messages: [action.data]});
    } else {
      newState[index].messages.push(action.data);
    }
    return newState;
  }
  if (action.type === 'addMsgByOneContact') {
    console.log('[Reducer]addMsgByOneContact');
    // [case3] add messages with a single contact
    // return newState;
  }

  if (action.type === 'addMsgByManyContact') {
    console.log('[Reducer]addMsgByManyContact');
    // [case4] add messages with multiple contacts
    // action.data: [{contact1, messages}, {contact2, messages}, .... ]
    for (let i=0; i<action.data.length; i += 1) {
      const index = newState.findIndex((item) => item.contact === action.data[i].contact);
      if (index === -1) {
        newState.push(action.data[i]);
      } else {
        newState[index].messages = [...newState[index].messages, ...action.data[i].messages];
      }
    }
    return newState;
  }
  return newState;
};

const messageContactList = (state = [], action) => {
  const newState = [...state];
  if (action.type === 'addMsgContactByOne') {
    console.log('[Reducer]addMsgContactByOne');
    // [case1] add a single contact
    // action.data: { name, display }
    const index = newState.findIndex((user) => user.name === action.data.name);
    if (index === -1) {
      newState.push(action.data);
      return newState;
    } else {
      return newState;
    }
  }
  if (action.type === 'addMsgContactByMany') {
    console.log('[Reducer]addMsgContactByMany');
    // [case2] add array of contacts return from getAllContact() function
    // action.data: [contact1, contact2, ... ]
    console.log(action.data);
    const msgContacts = action.data;
    msgContacts.sort();
    for (let i=0; i<msgContacts.length; i += 1) {
      const index = newState.findIndex((user) => user.name === msgContacts[i]);
      if (index === -1) {
        newState.push({ name: msgContacts[i], display: true });
      }
    }
    return newState;
  }

  return newState;
};

const allContacts = (state = [], action) => {
  if (action.type === 'addContacts') {
    console.log(`[Reducer] add Contacts ${action.data}`);
    return [...state, ...action.data];
  }
  return state;
};

const postsUpdateNotification = (state = { id: 0, sender: null }, action) => {
  if (action.type === 'updatePosts') {
    console.log(`[Reducer] new posts from ${action.data}`);
    return { id: state.id + 1, data: action.data };
  }
  return state;
}

const postsDeleteNotification = (state = 0, action) => {
  if (action.type === 'deletePost') {
    console.log('[Reducer] delete posts');
    return state + 1;
  }
  return state;
}

const selectedContact = (state = null, action) => {
  if (action.type === 'selectContact') {
    console.log(`[Reducer] selectContact: ${action.data}`)
    return action.data;
  }
  return state;
};

const msgUpdateNotification = (state = { id: 0, sender: null }, action ) => {
  if (action.type === 'msgUpdateNotification') {
    console.log(`[Reducer] msgUpdateNotification from ${action.data}`);
    return { id: state.id + 1, sender: action.data };
  }
  return state;
};

const updateCommentsNotification = (state = { id: 0, data: null }, action) => {
  if (action.type === 'updateComments') {
    console.log(`[Reducer] updateComments ${action.data}`);
    return { id: state.id + 1, data: action.data };
  }
  if (action.type === 'resetComments') {
    return { id: 0, data: null };
  }
  return state;
}


const rootReducer = combineReducers({
  messageRawData,
  messageContactList,
  postsUpdateNotification,
  postsDeleteNotification,
  msgUpdateNotification,
  selectedContact,
  allContacts,
  updateCommentsNotification
});

export { rootReducer };
