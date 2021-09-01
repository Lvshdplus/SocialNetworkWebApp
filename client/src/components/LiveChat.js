import './style.css';
import LiveChatItem from "./LiveChatItem";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { generateChatToken } from '../fetch/liveFetch';
const ChatAPI = require("twilio-chat")

function LiveChat(props) {
  const username = props.username;
  const room = props.room;
  const startLive = props.startLive;
  // const [startLive, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState(null);
  const [text, setText] = useState("");

  useEffect(async() => {
    let token = "";

    setLoading(true);

    try {
      token = await getToken();
    } catch(e) {
      throw new Error("Unable to get token, please reload this page");
    }

    const client = await ChatAPI.Client.create(token);

    client.on("tokenAboutToExpire", async () => {
      const token = await getToken();
      client.updateToken(token);
    });

    client.on("tokenExpired", async () => {
      const token = await getToken();
      client.updateToken(token);
    });

    client.on("channelJoined", async (channel) => {
      if (startLive) {
        setMessages([]);
      } else {
        const newMessages = await channel.getMessages();
        setMessages(newMessages.items || []);
      }
    });
        
    try {
      const channel = await client.getChannelByUniqueName(room);
      joinChannel(channel);
      setChannel(channel)
    } catch(err) {
      try {
        const channel = await client.createChannel({
          uniqueName: room,
          friendlyName: room,
        });
          
        joinChannel(channel);
      } catch {
        throw new Error("Unable to create channel, please reload this page");
      }
    }
  }, [])

  const updateText = e => setText(e);

  const joinChannel = async (channel) => {
    if (channel.channelState.status !== "joined") {
      await channel.join();
    }
     
    setChannel(channel);
    setLoading(false)
     
    channel.on('messageAdded', function(message) {
      handleMessageAdded(message)
    });
  };

  const getToken = async () => {
    const data = await generateChatToken(username, room);
    return data.token;
  }

  const handleMessageAdded = message => {
    setMessages(messages =>[...messages, message]);
  };

  const sendMessage = () => {
    if (text) {
      setLoading(true)
      channel.sendMessage(String(text).trim());
      setText('');
      setLoading(false)
    }
  };

  return (
    <div className="live-element">
      <div className="sidebar">
        <h2>Live Comments</h2>
      </div>
      <div className="chatContainer">
        <div className="chatContents">
          {(messages && room !== "chat") &&
            messages.map((message) => 
              <LiveChatItem
                key={message.index}
                message={message}
                username={username}/>
          )}
        </div>
        <div className="chatFooter">
          <input type="text" placeholder="Type Message" onChange={(e)=>updateText(e.target.value)} value={text} />
          <button onClick={sendMessage} >Send</button>
        </div>
      </div>
    </div>
  )
}

export default LiveChat
