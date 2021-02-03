import { useState, useEffect } from 'react';
import Socket from './libs/socket';

// let peers = [];

const App = () => {
  const [socket, setSocket] = useState();
  const [peers, setPeers] = useState({});

  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [joinedRoom, setJoinedRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new Socket('http://localhost:3100');
    socket.start();

    setSocket(socket);
    // setPeer(peer);

    return () => {
      if (!socket) return;
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(peers).map((peer) => peer.close());
    };
  }, [peers]);
  useEffect(() => {
    if (!socket) return;

    socket.on('join', (state) => {
      if (state.status !== 'success') return;
      setJoinedRoom(state.room);
    });
    socket.on('leave', (state) => {
      if (state.status !== 'success') return;
      setJoinedRoom('');
    });
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on('requestOffer', async (id) => {
      const peer = new RTCPeerConnection({});
      const dataChannel = peer.createDataChannel('candidate');
      setPeers({ ...peers, [id]: peer });

      const offer = await peer.createOffer();
      peer.setLocalDescription(offer).then(() => {
        console.log('sendOffer to', id);
        socket.sendOffer(id, peer.localDescription);
      });
    });
    socket.on('offer', async (id, offer) => {
      const peer = new RTCPeerConnection({});
      const dataChannel = peer.createDataChannel('candidate');
      setPeers({ ...peers, [id]: peer });

      peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      peer.setLocalDescription(answer).then(() => {
        console.log(peer.localDescription.sdp);
        socket.sendAnswer(id, peer.localDescription);
      });
    });
    socket.on('candidate', (id, sdp) => {
      const peer = peers[id];
      peer.addIceCandidate(sdp);
      // peers[id] = peer;
    });
    socket.on('answer', (id, answer) => {
      const peer = peers[id];
      if (!peer) return;

      console.log(peers);
      peer.setRemoteDescription(answer);

      // peers[id] = peer;
    });
  }, [socket, peers]);

  useEffect(() => {
    Object.keys(peers).map((i) => {
      const peer = peers[i];
      peer.addEventListener('connectionstatechange', () => {
        console.log(peer.connectionState, peer.signalingState);
      });
      peer.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          console.log('offer', peer.localDescription);
          socket.sendCandidate(i, peer.localDescription);
        }
      });

      return null;
    });
  }, [socket, peers]);

  // useEffect(() => {
  //   if (!peer) return;

  //   // peer.addEventListener('icecandidate', event => {
  //   //   console.log(event)
  //   //   if(event.candidate) {
  //   //     console.log(event.candidate.sdp)
  //   //     sendOffer(peer.localDescription.sdp) // Tricle
  //   //   }
  //   //   sendOffer(peer.localDescription.sdp) // Vanilla
  //   // })

  //   // peer.addEventListener('iceconnectionstatechange', event => {
  //   //   console.log(`IceConnection : ${peer.iceConnectionState}`)
  //   // })
  //   // peer.addEventListener('icegatheringstatechange', event => {
  //   //   console.log(`IceGathering : ${peer.iceGatheringState}`)
  //   // })
  //   // peer.addEventListener('signalingstatechange', () => {
  //   //   console.log(`PeerSignaling : ${peer.signalingState}`,)
  //   // })
  //   // peer.addEventListener('connectionstatechange', () => {
  //   //   console.log(`PeerConnection : ${peer.connectionState}`)
  //   // })
  // }, [peer]);

  const joinRoom = () => {
    socket.joinRoom(roomName, userName);
  };

  const leaveRoom = () => {
    socket.leaveRoom();
  };

  const sendMessage = () => {
    socket.sendMessage(message);
  };

  const sendRequestOffer = () => {
    console.log('sendRequestOffer');
    socket.sendRequestOffer();
  };

  return (
    <div className="App">
      <button onClick={() => sendRequestOffer()}>sendRequestOffer</button>
      {/* // <button onClick={() => receiveOffer()}>receiveOffer</button>
      // <button onClick={() => receiveAnswer()}>receiveAnswer</button> */}
      <div>
        <p>
          Socket.IO コネクション接続状態 :{' '}
          {socket && socket.connectionState === 'connected'
            ? '接続済み'
            : '未接続'}
          <br />
          ルーム接続状態 :{' '}
          {joinedRoom ? `${joinedRoom}に接続中` : 'ルームに接続されていません'}
          <br />
          WebRTCピア接続状態 : 未接続
        </p>
        <input
          placeholder="room"
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
        />
        <input
          placeholder="name"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />
        <input
          placeholder="message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button onClick={() => joinRoom()}>join</button>
        <button onClick={() => leaveRoom()}>leave</button>
        <button onClick={() => sendMessage()}>message</button>
      </div>
      {/* <p>
        <textarea value={offer} onChange={e => setOffer(e.target.value)}></textarea><br />
        <textarea value={answer} onChange={e => setAnswer(e.target.value)}></textarea>
      </p> */}
      <div>
        <h2>chat by Socket.IO {joinedRoom ? `in ${joinedRoom}` : ''}</h2>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>
              {msg.user} : {msg.body}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
