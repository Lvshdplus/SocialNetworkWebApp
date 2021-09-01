import React, { useState, useCallback, useEffect } from 'react';
import { Button, Divider } from 'antd';
import Video from 'twilio-video';
import Room from './Room';
import Webavatar from './Webavatar'; 
import { getLives, generateVideoToken, startLive,  endLive } from '../fetch/liveFetch';

const VideoChat = (props) => {
  const username = props.user;
  const [roomName, setRoomName] = useState(props.user);
  const [room, setRoom] = useState(null);
  const [sid, setSID] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [listName, setNames] = useState([]);
  const [listSID, setSIDs] = useState([]);

  useEffect(() => {
    getLives(username).then(res => {
      setNames(res.data);
      setSIDs(res.data2);
    });
  }, []);

  // Join live stream
  async function joinRoom(roomname, sid) {
    setConnecting(true);
    const data = await generateVideoToken(username, roomname);
    Video.connect(data.token, {
      name: roomname,
    })
      .then((room) => {
        setConnecting(false);
        setRoomName(roomname);
        setSID(sid);
        setRoom(room);
      })
      .catch((err) => {
        console.error(err);
        setConnecting(false);
      });
  }
  
  // Start live
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setConnecting(true);
      const data = await generateVideoToken(username, roomName);
      Video.connect(data.token, {
        name: roomName,
      })
        .then((room) => {
          setConnecting(false);
          setSID(room.localParticipant.sid);
          startLive(username, room.localParticipant.sid);
          setRoom(room);
        })
        .catch((err) => {
          console.error(err);
          setConnecting(false);
        });
    },
    [roomName, username]
  );

  // Leave live stream
  const handleLogout = useCallback(() => {
    endLive(username);
    setRoom((prevRoom) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach((trackPub) => {
          trackPub.track.stop();
        });
        prevRoom.disconnect();
      }
      return null;
    });
  }, []);

  // Return
  useEffect(() => {
    if (room) {
      const tidyUp = (event) => {
        if (event.persisted) {
          return;
        }
        if (room) {
          handleLogout();
        }
      };
      window.addEventListener("pagehide", tidyUp);
      window.addEventListener("beforeunload", tidyUp);
      return () => {
        window.removeEventListener("pagehide", tidyUp);
        window.removeEventListener("beforeunload", tidyUp);
      };
    }
  }, [room, handleLogout]);

  // Userbox for lists of users
  function UserBox (props) {
    const info = (
      <div className='avatar-name'>
        <Webavatar name={props.name} />
        <span className='name'> {props.name} </span>
      </div>
    );
    let streamBtn;
    streamBtn = (
      <div>
        <Button type="primary" shape="round" ghost className='Button' onClick={() => joinRoom(props.name, props.sid)}>
          Stream
        </Button>
      </div>
    );

    return (
      <div className='contact-card'>
        <div className='contact-card-inside'>
          {info} {streamBtn}
        </div>
        <Divider/>        
      </div>
    )
  };

  // Find list of followees who are streaming
  function makeList (listName, listSID) {
    if (listName.length === 0) {
      return (
        <h3>No one is live</h3>
      )
    } else {
      return listName.map((contactEntry, index) => {
        return (
          <li className="listItem" key={index.toString()}>
            <UserBox name={contactEntry} sid={listSID[index]}/>
          </li>
        )
      });
    }
  }

  let render;
  if (room) {
    render = (
      <Room 
        username={username}
        roomName={roomName}
        room={room}
        sid={sid}
        handleLogout={handleLogout} />
    );
  } else {
    render = (
      <div id='lobby'>
        <Button 
          type="primary" 
          shape="round" 
          ghost className='Button' 
          onClick={handleSubmit}>
            {connecting ? "Connecting" : "Go Live"}
        </Button>
        <h1>Who's Live?</h1>
        <ul className="list">
          {makeList(listName, listSID)}
        </ul>
      </div>
    );
  }
  return render;
};

export default VideoChat;
