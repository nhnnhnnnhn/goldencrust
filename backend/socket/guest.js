const Guest = require('../api/v1/models/guest.model');
const Message = require('../api/v1/models/message.model');
const guestSockets = new Map();

function setupGuestNamespace(io) {
    const guestIO = io.of('/guest');

    guestIO.on('connection', (socket) => {
        console.log('[GUEST] Guest connected:', socket.id);

        socket.on('guestOnline', (visitorId) => {
            guestSockets.set(visitorId, socket.id);
            console.log(`[GUEST] Visitor ${visitorId} online`);
        });

        socket.on('sendMessageFromGuest', async (data) => {
            try {
                const { visitorId, guestId, text } = data;

                const message = await Message.create({
                    guest: guestId,
                    senderType: 'guest',
                    text,
                });
                socket.emit('messageSent', { message });
                console.log(`[GUEST] New message from ${visitorId}:`, text);

            } catch (err) {
                console.error('[GUEST] Error sending message:', err);
                socket.emit('errorMessage', { message: 'Không thể gửi tin nhắn' });
            }
        });
        
        socket.on('disconnect', () => {
            for (const [visitorId, socketId] of guestSockets.entries()) {
                if (socketId === socket.id) {
                    guestSockets.delete(visitorId);
                    console.log(`[GUEST] Visitor ${visitorId} disconnected`);
                }
            }
        });
    });

    return { guestIO, guestSockets };
}

module.exports = setupGuestNamespace;
