import skyway from 'skyway-js';
import { useEffect, useState, useRef } from 'react';

const SkyWay = () => {
  const [peer, setPeer] = useState();
  const [roomName, setRoomName] = useState('');
  const [connection, setConnection] = useState();
  const [joinedRoom, setJoinedRoom] = useState('');
  const [userCount, setUserCount] = useState(0);

  // const localAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    const peer = new skyway({
      debug: 3,
      key: '42beb454-f1a8-4b12-b991-c1579457503b',
    });
    setPeer(peer);
  }, []);

  useEffect(() => {
    if (!connection) return;

    connection.on('open', () => {
      console.log('open');
      setUserCount(connection.members.length);
    });

    connection.on('leave', () => {
      setUserCount(connection.members.length);
    });

    connection.on('stream', (stream) => {
      console.log(stream);
      remoteAudioRef.current.srcObject = stream;
    });

    connection.on('peerJoin', () => {
      console.log(connection.members.length);
      setUserCount(connection.members.length);
    });

    connection.on('peerLeave', () => {
      console.log(connection.members.length);
      setUserCount(connection.members.length);
    });

    return () => connection.close();
  }, [connection]);

  const joinRoom = async (room) => {
    console.log('joinRoom');
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // localAudioRef.current.srcObject = localStream;

    if (!peer || room === '') {
      console.log('not ready');
      return;
    }

    const con = peer.joinRoom(room, {
      mode: 'sfu',
      stream: localStream,
    });

    setConnection(con);
    setJoinedRoom(roomName);
  };

  const leaveRoom = () => {
    if (!connection) return;
    connection.close();

    setJoinedRoom('');
  };

  return (
    <div>
      <div>
        <p>
          SkyWay接続状態 : {peer && peer.open ? '接続済み' : '未接続'}
          <br />
          接続ルーム : {joinedRoom ? joinedRoom : '接続していません'}
          <br />
          接続人数 : {joinedRoom ? userCount + 1 : 0}人
        </p>
      </div>
      <div>
        <input
          placeholder="room"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        ></input>
      </div>
      <div>
        <button onClick={() => joinRoom(roomName)}>join</button>
        <button onClick={() => leaveRoom()}>leave</button>
      </div>
      <div>
        {/* <audio ref={localAudioRef} autoPlay controls /> */}
        <audio ref={remoteAudioRef} autoPlay controls />
      </div>
    </div>
  );
};

export default SkyWay;
