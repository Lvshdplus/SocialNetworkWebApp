import React, { useEffect, useState } from "react";
import { Button } from 'antd';
import Participant from "./Participant";
import LiveChat from "./LiveChat";
import './style.css'

const Room = ({ username, roomName, room, sid, handleLogout }) => {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const participantConnected = (participant) => {
      setParticipants((prevParticipants) => [...prevParticipants, participant]);
    };

    const participantDisconnected = (participant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    };

    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);
    room.participants.forEach(participantConnected);

    return () => {
      room.off("participantConnected", participantConnected);
      room.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  if (username === roomName) {
    // Live Streamer
    return(
      <div className="room">
        <h2>Live: {roomName}</h2>
        <Button type="primary" danger shape="round" ghost className='Button' onClick={handleLogout}>
          End Live
        </Button>
        <div className="viewers">Viewers: {participants.length}</div>
        <div className="local-participant">
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
          <LiveChat
          room={roomName}
          username={username}
          participant={room.localParticipant}
          startLive={true}
          />
        </div>
      </div>
    );
  } else {
    // Other streamers
    return(
      <div className="room">
        <h2>Live: {roomName}</h2>
        <Button type="primary" danger shape="round" ghost className='Button' onClick={handleLogout}>
          Leave
        </Button>
        <div className="viewers">Viewers: {participants.length}</div>
        <div className="local-participant">
          {room.participants.get(sid) ? (
            <Participant
              key={sid}
              participant={room.participants.get(sid)}
            />
          ) : (
            <h1>Live stream ended</h1>
          )}
          <LiveChat
            room={roomName}
            username={username}
            participant={room.localParticipant}
            startLive={false}
          />
        </div>
      </div>
    );
  }
};

export default Room;
