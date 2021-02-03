const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

const userStoreWithId = {};

app.get('/', (req, res) => {
  return res.send('hello world');
});

io.on('connection', (socket) => {
  socket.on('join', (obj, ack) => {
    if (obj.room === '') {
      ack({
        status: 'error',
        error: {
          message: 'Roomname is empty.',
        },
      });
      return;
    }
    console.log(userStoreWithId[socket.id]);

    if (userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'Already joined.',
        },
      });
      return;
    }

    socket.join(obj.room);
    userStoreWithId[socket.id] = { room: obj.room, user: obj.user };
    console.log(`${socket.id} is joined ${obj.room} by ${obj.user}`);

    ack({
      status: 'success',
      room: obj.room,
      user: obj.user,
    });
  });

  socket.on('leave', (ack) => {
    if (!userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'Already leaved.',
        },
      });
      return;
    }

    console.log(userStoreWithId[socket.id]);
    socket.leave(userStoreWithId[socket.id].room);
    console.log(
      `${socket.id} is leaved ${userStoreWithId[socket.id].room} by ${
        userStoreWithId[socket.id].user
      }`
    );
    userStoreWithId[socket.id] = undefined;

    ack({
      status: 'success',
    });
  });

  socket.on('message', (message, ack) => {
    if (!userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'No Connected to Room.',
        },
      });
      return;
    }

    io.to(userStoreWithId[socket.id].room).emit('message', {
      user: userStoreWithId[socket.id].user,
      body: message,
    });

    ack({
      status: 'success',
    });
  });

  socket.on('requestOffer', (ack) => {
    console.log(ack);
    if (!userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'No Connected to Room.',
        },
      });
      return;
    }

    io.to(userStoreWithId[socket.id].room).emit('requestOffer', socket.id);

    ack({
      status: 'success',
    });
  });

  socket.on('offer', (id, sdp, ack) => {
    if (!userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'No Connected to Room.',
        },
      });
      return;
    }

    io.to(id).emit('offer', socket.id, sdp);
  });

  socket.on('answer', (id, answer, ack) => {
    if (!userStoreWithId[socket.id]) {
      ack({
        status: 'error',
        error: {
          message: 'No Connected to Room.',
        },
      });
      return;
    }

    io.to(id).emit('answer', socket.id, answer);
  });
});

http.listen(3100, () => {
  console.log('ready');
});
