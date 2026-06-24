let io;

export const initializeSocket = (socketInstance) => {

    io = socketInstance;

    io.on("connection", (socket) => {

        console.log(`🔌 User Connected: ${socket.id}`);

        socket.on("disconnect", () => {

            console.log(`❌ User Disconnected: ${socket.id}`);

        });

    });

};

export const getIO = () => {

    if (!io) {

        throw new Error("Socket.IO not initialized");

    }

    return io;

};