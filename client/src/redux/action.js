// -----------------[messageRawData]-------------------------
const recvMsgByOne = (data) => ({
  type: 'recvMsgByOne',
  data,
});

const sendMsgByOne = (data) => ({
  type: 'sendMsgByOne',
  data,
});

const addMsgByOneContact = (data) => ({
  type: 'addMsgByOneContact',
  data,
});

const addMsgByManyContact = (data) => ({
  type: 'addMsgByManyContact',
  data,
});

// -------------[messageContactList]---------------------------
const addMsgContactByOne = (data) => ({
  type: 'addMsgContactByOne',
  data,
});

const addMsgContactByMany = (data) => ({
  type: 'addMsgContactByMany',
  data,
})

// --------------[message notification]------------------------
const msgUpdateNotification = (sender) => ({
  type: 'msgUpdateNotification',
  data: sender,
});

// -----------[post updates] -------------
const updatePosts = (sender) => ({
  type: 'updatePosts',
  data: sender,
});

const deletePost = () => ({
  type: 'deletePost',
});

// -----------[selected contact]-----------
const selectContact = (name) => ({
  type: 'selectContact',
  data: name,
})

// -----------[all contacts]------------------
const addContacts = (name) => ({
  type: 'addContacts',
  data: name,
});

// -----------[update comments]-----------------
const updateComments = (data) => ({
  type: 'updateComments',
  data,
});

const resetComments = () => ({
  type: 'resetComments',
});

export { 
  recvMsgByOne,
  sendMsgByOne, 
  addMsgByOneContact,
  addMsgByManyContact,
  addMsgContactByOne,
  addMsgContactByMany,
  updatePosts,
  deletePost,
  selectContact,
  msgUpdateNotification,
  addContacts,
  updateComments,
  resetComments,
};