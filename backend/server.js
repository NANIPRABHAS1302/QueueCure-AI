import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/socket/socketServer.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        await connectDB();

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        initializeSocket(io);

        server.listen(PORT, () => {

            console.log(
                `🚀 QueueCure Backend Running on Port ${PORT}`
            );

        });

    } catch (error) {

        console.error(error);

    }

};

startServer();