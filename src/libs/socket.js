import { io } from 'socket.io-client';
import { EventEmitter } from 'events';

class Socket extends EventEmitter {
  constructor(socketIOURL) {
    super();

    this.socket = io(socketIOURL);
    this.connectionState = '';

    this.roomName = '';
    this.userName = '';
  }

  start() {
    this.handleConnect();
    this.handleReceiveMessage();
    this.handleReceiveOffer();
    this.handleOffer();
    this.handleCandidate();
    this.handleAnswer();

    this.socket.connect();
  }

  handleConnect() {
    this.socket.on('connect', () => {
      this.connectionState = 'connected';
      console.log(`connectionState : ${this.connectionState}`);
    });
  }

  handleReceiveMessage() {
    this.socket.on('message', (msg) => {
      console.log('handleReceiveMessage');
      this.emit('message', msg);
    });
  }

  handleReceiveOffer() {
    this.socket.on('requestOffer', (id) => {
      console.log('requestOffer from', id);
      if (id === this.socket.id) return;

      this.emit('requestOffer', id);
    });
  }

  handleOffer() {
    this.socket.on('offer', (id, offer) => {
      console.log('offer from', id);
      this.emit('offer', id, offer);
    });
  }

  handleCandidate() {
    this.socket.on('candidate', (id, sdp) => {
      console.log('candidate from', id);
      this.emit('candidate', id, sdp);
    });
  }

  handleAnswer() {
    this.socket.on('answer', (id, answer) => {
      console.log('answer from', id);
      this.emit('answer', id, answer);
    });
  }

  /**
   * ルームに参加する
   * @param {string} room
   * @param {string} user
   */
  joinRoom(room, user) {
    if (!this.socket.connected) {
      console.log('No Connection');
      return null;
    }

    this.socket.emit('join', { room, user }, (state) => {
      if (state.status === 'success') {
        this.roomName = room;
        this.userName = user;
      }

      this.emit('join', state);
    });
  }

  /**
   * ルームから退出する
   */
  leaveRoom() {
    if (!this.socket.connected) {
      console.log('No Connection');
      return null;
    }

    this.socket.emit('leave', (state) => {
      if (state.status === 'success') {
        this.roomName = '';
      }

      this.emit('leave', state);
    });
  }

  sendMessage(msg) {
    if (!this.roomName) {
      console.log('Not joining room.');
      return null;
    }

    this.socket.emit('message', msg, (state) => {});
  }

  sendRequestOffer() {
    if (!this.roomName) {
      console.log('Not joining room.');
      return null;
    }

    this.socket.emit('requestOffer', (state) => {
      console.log(state);
    });
  }

  sendOffer(id, offer) {
    if (!this.roomName) {
      console.log('Not joining room.');
      return null;
    }

    this.socket.emit('offer', id, offer, (state) => {
      console.log(state);
    });
  }

  sendCandidate(id, sdp) {
    if (!this.roomName) {
      console.log('Not joining room.');
      return null;
    }

    this.socket.emit('candidate', id, sdp, (state) => {
      console.log(state);
    });
  }

  sendAnswer(id, sdp) {
    if (!this.roomName) {
      console.log('Not joining room.');
      return null;
    }

    this.socket.emit('answer', id, sdp, (state) => {
      console.log(state);
    });
  }
}

export default Socket;
