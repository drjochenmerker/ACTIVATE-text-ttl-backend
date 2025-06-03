import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: IOServer;

export function setupSocketIO(server: HTTPServer) {
    io = new IOServer(server, {
        cors: {
            origin: `${process.env.ACTIVATE_URL}:${process.env.ACTIVATE_PORT}`,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Optional: Events für einzelne Clients
    });
}

export function getIO() {
    return io;
}
