"use strict";

var _require = require('socket.io'),
    Server = _require.Server;

module.exports = function (req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0'); // Prevent caching

  var io = new Server(res.socket.server); // Enable WebSocket connection on Vercel's serverless functions

  if (!res.socket.server.io) {
    console.log('New socket.io server');
    res.socket.server.io = io; // Handle connections and broadcasting

    io.on('connection', function (socket) {
      console.log('A user connected'); // Handle user registration

      socket.on('register_user', function (data) {
        var username = data.username;
        socket.emit('user_status', {
          username: username,
          status: 'online'
        });
        socket.broadcast.emit('user_joined', {
          username: username
        });
      }); // Handle public messages

      socket.on('send_message', function (data) {
        var username = data.username,
            message = data.message;
        var timestamp = new Date().toLocaleTimeString();
        var newMessage = {
          username: username,
          message: message,
          timestamp: timestamp,
          isPrivate: false
        };
        io.emit('new_message', newMessage);
      }); // Handle private messages

      socket.on('send_private_message', function (data) {
        var sender = data.sender,
            receiver = data.receiver,
            message = data.message;
        var timestamp = new Date().toLocaleTimeString();
        var newMessage = {
          username: sender,
          message: message,
          timestamp: timestamp,
          isPrivate: true
        };

        if (receiver) {
          io.to(receiver).emit('new_private_message', newMessage);
        }
      }); // Handle disconnections

      socket.on('disconnect', function () {
        console.log('A user disconnected');
      });
    });
  }

  res.send('Socket.io server running');
};
//# sourceMappingURL=chat.dev.js.map
