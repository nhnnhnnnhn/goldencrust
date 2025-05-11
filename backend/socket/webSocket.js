const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../api/v1/models/user.model');
const Message = require('../api/v1/models/message.model');
const Notification = require('../api/v1/models/notification.model');
const Guest = require('../api/v1/models/guest.model');
const setupGuestNamespace = require('./guest');

const onlineUser = new Map();

function initWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        }
    });

    const { guestIO, guestSockets } = setupGuestNamespace(io);

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error("No token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || user.isSuspended) return next(new Error("Unauthorized"));
            socket.user = user;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        const userId = user._id.toString();

        if (!onlineUser.has(userId)) {
            onlineUser.set(userId, new Set());
        }
        onlineUser.get(userId).add(socket.id);

        socket.emit('connected', { userId, role: user.role });

        socket.on('getOnlineUsers', () => {
            const onlineUsers = Array.from(onlineUser.keys()).map(id => ({
                id,
                role: onlineUser.get(id).role
            }));
            socket.emit('onlineUsers', onlineUsers);
        });

        // Message from employee to guest
        socket.on('sendMessageFromEmployee', async (data) => {
            try {
                const { visitorId, text } = data;
                const guest = await Guest.findOne({ visitorId });
                if (!guest) return socket.emit('errorMessage', { message: 'Guest not found' });

                const message = await Message.create({
                    guest: guest._id,
                    user: user._id,
                    senderType: 'employee',
                    text,
                });

                for (let [targetUserId, socketSet] of onlineUser.entries()) {
                    const targetUser = await User.findById(targetUserId);
                    if (!targetUser || targetUser.role !== 'employee') continue;

                    socketSet.forEach(socketId => {
                        io.to(socketId).emit('newEmployeeMessage', message);
                    });
                }

                const guestSocketId = guestSockets.get(guest.visitorId);
                if (guestSocketId) {
                    io.to(guestSocketId).emit('newMessage', message);
                }

                socket.emit('messageSent', message);

            } catch (err) {
                console.error("Error sending message from employee:", err);
                socket.emit('errorMessage', { message: 'Không thể gửi tin nhắn' });
            }
        });

        // Message from user to employee
        socket.on('sendMessageFromUser', async (data) => {
            try {
                const { text } = data;

                const message = await Message.create({
                    user: user._id,
                    senderType: 'user',
                    text,
                });

                for (let [targetUserId, socketSet] of onlineUser.entries()) {
                    const targetUser = await User.findById(targetUserId);
                    if (!targetUser || targetUser.role !== 'employee') continue;

                    socketSet.forEach(socketId => {
                        io.to(socketId).emit('newMessage', message);
                    });
                }

                socket.emit('messageSent', message);

            } catch (err) {
                console.error("Error sending message from user:", err);
                socket.emit('errorMessage', { message: 'Không thể gửi tin nhắn' });
            }
        });

        // Message from employee to user
        socket.on('sendMessageFromEmployeeToUser', async (data) => {
            try {
                const { userId, text } = data;

                console.log("➡️ Received sendMessageFromEmployeeToUser with:", data);

                const message = await Message.create({
                    user: userId,
                    senderType: 'employee',
                    text,
                });

                console.log("✅ Message created:", message);

                if (onlineUser.has(userId)) {
                    const socketSet = onlineUser.get(userId);
                    console.log("🔗 Target user online with sockets:", Array.from(socketSet));
                    socketSet.forEach(socketId => {
                        io.to(socketId).emit('newMessage', message);
                    });
                } else {
                    console.log("⚠️ User not online:", userId);
                }

                socket.emit('messageSent', message);
            } catch (err) {
                console.error("❌ Error sending message from employee to user:", err);
                socket.emit('errorMessage', { message: 'Không thể gửi tin nhắn' });
            }
        });


        socket.on("sendNotification", async (data) => {
            try {
                const { recipientType, recipient, type, content, link } = data;
                const notification = await Notification.create({
                    recipientType,
                    recipient,
                    sender: user._id,
                    type,
                    content,
                    link,
                });

                if (recipientType === "user") {
                    const socketSet = onlineUser.get(recipient);
                    if (socketSet) {
                        socketSet.forEach(socketId => {
                            io.to(socketId).emit("receiveNotification", notification);
                        });
                    }
                }

                if (recipientType === "guest" && guestSockets.has(recipient)) {
                    const guestSocketId = guestSockets.get(recipient);
                    io.of("/guest").to(guestSocketId).emit("receiveNotification", {
                        type,
                        content
                    });
                }

            } catch (err) {
                console.error("Error sending notification:", err);
                socket.emit("errorMessage", { message: "Không thể gửi thông báo" });
            }
        });

        socket.on('disconnect', () => {
            if (onlineUser.has(userId)) {
                onlineUser.get(userId).delete(socket.id);
                if (onlineUser.get(userId).size === 0) {
                    onlineUser.delete(userId);
                }
            }
        });
    });

    return { io, guestIO, guestSockets };
}

module.exports = initWebSocket;