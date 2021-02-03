import skyway from 'skyway-js';
import { useEffect, useState, useRef } from 'react';

const SkyWay = () => {
  const [peer, setPeer] = useState();
  const [roomName, setRoomName] = useState('');
  const [connection, setConnection] = useState();
  const [joinedRoom, setJoinedRoom] = useState('');

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

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
      console.log();
    });

    connection.on('stream', (stream) => {
      console.log(stream);
      remoteVideoRef.current.srcObject = stream;
    });

    return () => connection.close();
  }, [connection]);

  const joinRoom = async (room) => {
    console.log('joinRoom');
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = localStream;

    if (!peer || room === '') {
      console.log('not ready');
      return;
    }

    console.log(localStream);

    const con = peer.joinRoom(room, {
      mode: 'sfu',
      stream: localStream,
    });

    console.log(con);

    setConnection(con);
    setJoinedRoom(roomName);
  };

  return (
    <div>
      <div>
        <p>
          SkyWay接続状態 : {peer && peer.open ? '接続済み' : '未接続'}
          <br />
          接続ルーム : {joinedRoom ? joinedRoom : '接続していません'}
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
      </div>
      <div>
        <video ref={localVideoRef} autoPlay muted controls />
        <video ref={remoteVideoRef} autoPlay muted controls />
      </div>
    </div>
  );
};

export default SkyWay;
