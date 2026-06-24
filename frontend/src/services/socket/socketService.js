// Socket.IO Service utilizing CDN-loaded window.io

let socket = null;

export const connectSocket = () => {
    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";

    if (!socket && window.io) {
        try {
            socket = window.io(backendUrl, {
                transports: ["websocket", "polling"]
            });

            socket.on("connect", () => {
                console.log("🔌 Connected to Socket Server:", socket.id);
            });

            socket.on("disconnect", () => {
                console.log("❌ Disconnected from Socket Server");
            });
        } catch (error) {
            console.error("Socket.io initialization failed:", error.message);
        }
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => {
    if (!socket) {
        return connectSocket();
    }
    return socket;
};

export const socketListener = {
    on: (event, callback) => {
        const s = getSocket();
        if (s) s.on(event, callback);
    },
    off: (event, callback) => {
        const s = getSocket();
        if (s) s.off(event, callback);
    },
    emit: (event, data) => {
        const s = getSocket();
        if (s) s.emit(event, data);
    }
};
