const { Server } = require('socket.io');

module.exports = (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');  // Prevent caching

    const io = new Server(res.socket.server);
    
    // Enable WebSocket connection on Vercel's serverless functions
    if (!res.socket.server.io) {
        console.log('New socket.io server');
        res.socket.server.io = io;
        
        // Handle connections and broadcasting
        io.on('connection', (socket) => {
            console.log('A user connected');
            
            // Handle user registration
            socket.on('register_user', (data) => {
                const { username } = data;
                socket.emit('user_status', { username, status: 'online' });
                socket.broadcast.emit('user_joined', { username });
            });

            // Handle public messages
            socket.on('send_message', (data) => {
                const { username, message } = data;
                const timestamp = new Date().toLocaleTimeString();
                const newMessage = { username, message, timestamp, isPrivate: false };
                io.emit('new_message', newMessage);
            });

            // Handle private messages
            socket.on('send_private_message', (data) => {
                const { sender, receiver, message } = data;
                const timestamp = new Date().toLocaleTimeString();
                const newMessage = { username: sender, message, timestamp, isPrivate: true };
                if (receiver) {
                    io.to(receiver).emit('new_private_message', newMessage);
                }
            });

            // Handle disconnections
            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
    }
    
    res.send('Socket.io server running');
};
