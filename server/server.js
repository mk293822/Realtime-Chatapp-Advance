import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3000 });

const rooms = {}; // Stores room_id -> [{ userId, socket }]
const userSockets = new Map(); // Maps userId -> WebSocket connection

server.on("connection", (socket) => {
    let currentRoom = null;
    let userId = null;

    socket.on("message", async (message) => {
        let textData = message;
        if (message instanceof Blob) {
            textData = await message.text();
        }
        const data = JSON.parse(textData);
        handleMessage(socket, data);
    });

    const handleMessage = (socket, data) => {
        if (data.type === "join_room") {
            userId = data.user_id; // Get user ID from client
            const room_id = data.room_id;

            if (!rooms[room_id]) {
                rooms[room_id] = [];
            }

            // Store userId with socket
            rooms[room_id].push({ userId, socket });
            userSockets.set(userId, socket);
            currentRoom = room_id;

            console.log(`User ${userId} joined room: ${room_id}`);
            console.log(rooms);
        }

        if (data.type === "offer" || data.type === "answer" || data.type === "candidate") {
            if (currentRoom && rooms[currentRoom]) {
                rooms[currentRoom].forEach(({ socket: userSocket }) => {
                    if (userSocket !== socket) {
                        userSocket.send(JSON.stringify(data));
                    }
                });
            }
        }

        if (data.type === "get_users") {
            if (currentRoom && rooms[currentRoom]) {
                const usersInRoom = rooms[currentRoom].map(({ userId }) => userId);
                socket.send(JSON.stringify({ type: "users_list", users: usersInRoom }));
            }
        }
    };

    socket.on("close", () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter((user) => user.socket !== socket);
            userSockets.delete(userId);
            console.log(`User ${userId} disconnected from room: ${currentRoom}`);
        }
    });
});

console.log("WebSocket server running on ws://localhost:3000");
