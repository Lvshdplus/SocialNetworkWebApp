import React, { useState, useEffect } from "react";
import Webavatar from './Webavatar';
import { Button, Divider } from 'antd';
import { getLives } from '../fetch/liveFetch';

const Lobby = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit,
  connecting,
}) => {

  const [listName, setNames] = useState([]);
  const [listSID, setSIDs] = useState([]);

  useEffect(() => {
    getLives(username).then(res => {
      setNames(res.data);
      setSIDs(res.data2);
    });
  }, []);

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
        <Button type="primary" shape="round" ghost className='Button'>
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

  function makeList (listName, listSID) {
    return listName.map((contactEntry, index) => {
      console.log(listSID[index]);
      return (
        <li className="listItem" key={index.toString()}>
          <UserBox name={contactEntry} sid={listSID[index]}/>
        </li>
      )
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter a room</h2>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="field"
          value={username}
          onChange={handleUsernameChange}
          readOnly={connecting}
          required
        />
      </div>

      <div>
        <label htmlFor="room">Room name:</label>
        <input
          type="text"
          id="room"
          value={roomName}
          onChange={handleRoomNameChange}
          readOnly={connecting}
          required
        />
      </div>

      <button type="submit" disabled={connecting}>
        {connecting ? "Connecting" : "Join"}
      </button>
    </form>
  );
};

export default Lobby;
