// ES6 import or TypeScript
import { io } from 'socket.io-client';
import { recvMsgByOne, sendMsgByOne, addMsgContactByOne, updatePosts, deletePost, msgUpdateNotification, updateComments } from '../redux/action';
require('dotenv').config();

const domain = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : '';

export const setupWSConnection = (dispatch)  => {
  
  // if not registered, do nothing
  if(sessionStorage.getItem('UserToken') === null) {
      return;
  }

  // Create WebSocket connection
  const socket = io(domain, {
    extraHeaders: {
      token: sessionStorage.getItem('UserToken'),
    }
  });
  // client-side
  socket.on('connect', () => {
    console.log('My client id: ', socket.id); // x8WIv7-mJelg7on_ALbx
    // socket.emit('message', 'hello server');
  });

  socket.on('new message', (msg) => {
    console.log('new message');
    // const index = texts.current.findIndex((item) => item.contact === msg.sender);
    //   console.log(`[msg.ws] Not update list: ${index}`);
    //   if (index === -1) {
    //     texts.current.push({ contact: msg.sender, messages: [msg] });
    //     console.log('[msg.ws]update list');
    //     updateList();
    //   } else {
    //     texts.current[index].messages.push(msg);
    //   }
    //   update();
    dispatch(recvMsgByOne(msg));
    dispatch(addMsgContactByOne({ name: msg.sender, display: true}));
    dispatch(msgUpdateNotification(msg.sender));
  });

  socket.on('delivered message', (msg) => {
    console.log('deliver messgae');
      // const index = texts.current.findIndex((item) => item.contact === msg.receiver);
      // console.log(`[msg.ws] Not update list: ${index}`);
      // if (index === -1) {
      //   texts.current.push({ contact: msg.receiver, messages: [msg] });
      //   updateList();
      // } else {
      //   texts.current[index].messages.push(msg);
        
      //   // update();
      // }
      // update();
    dispatch(sendMsgByOne(msg));
    dispatch(addMsgContactByOne({ name: msg.receiver, display: true}));
  })

  socket.on('new post', (data) => {
    dispatch(updatePosts(data));
  });

  socket.on('delete post', () => {
    dispatch(deletePost());
  });

  socket.on('new comment', (data) => {
    dispatch(updateComments(data));
  });

  // // Connection opened
  // socket.addEventListener('open', () => {
  //     console.log('ws connection opened');
  //     socket.send('Hello Server!');
  // });

  // // Listener for messages
  // socket.addEventListener('message', (event) => {
  //     // parse message to json
  //     const pushMessage = JSON.parse(event.data);
  //   console.log('Message from server ', pushMessage.data);
  //   if(pushMessage.type === 'delivered'){
  //     console.log('deliver messgae');
  //     const index = texts.current.findIndex((item) => item.contact === pushMessage.data.receiver);
  //     console.log(`[msg.ws] Not update list: ${index}`);
  //     if (index === -1) {
  //       texts.current.push({ contact: pushMessage.data.receiver, messages: [pushMessage.data] });
  //       updateList();
  //     } else {
  //       texts.current[index].messages.push(pushMessage.data);
        
  //       // update();
  //     }
  //     // console.log(`[msg.ws] Not update list: ${index}`);
  //     // texts.current.push(`sent(${pushMessage.to}): ${pushMessage.text}`);
  //     // update previous message box via state and props
  //     update();
      
  //   }
  //   if(pushMessage.type === 'new message'){
  //     console.log('new message');
  //     const index = texts.current.findIndex((item) => item.contact === pushMessage.data.sender);
  //     console.log(`[msg.ws] Not update list: ${index}`);
  //     if (index === -1) {
  //       texts.current.push({ contact: pushMessage.data.sender, messages: [pushMessage.data] });
  //       console.log('[msg.ws]update list');
  //       updateList();
  //     } else {
  //       texts.current[index].messages.push(pushMessage.data);
        
  //     }
  //     // texts.current.push(`${pushMessage.from}: ${pushMessage.text}`);
  //     // update previous message box via state and props
  //     update();
  //   }
  // });

  // // Connection closed
  // socket.addEventListener('close', (_event) => {
  //   console.log('Connection closed bye bye! ');
  // });
}
