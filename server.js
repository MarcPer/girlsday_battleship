const io = require("socket.io");
const server = io.listen(8000);

let players = new Map();
let currentPlayer;

server.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    if (players.size >= 2) {
        socket.emit("msg", "Sorry, too many players already.");
        socket.disconnect();
    }

    socket.emit("msg", "Welcome");
    players.set(socket.id, socket);

    socket.on("input", (msg) => {
        if (socket.id != currentPlayer) {
            socket.emit("msg", "ERROR: Not your turn");
        }
        else {
            socket.emit("msg", "OK");
        }
    });

    socket.on("disconnect", () => {
        players.delete(socket.id);
        console.info(`Client gone [id=${socket.id}]`);
    });
});

let broadcast = (msg, clientId) => {
    if (clientId === null) {
        return;
    }
    if (clientId) {
        let client = players.get(clientId);
        client && client.emit("msg", msg);
    }
    else {
        for (const [_id, client] of players.entries()) {
            client.emit("msg", msg);
        }
    }
};

let gameLoop = () => {
    if (players.size < 2) {
        broadcast("Waiting for another player");
    }
    else if (currentPlayer == undefined) {
        let playerIds = Array.from(players.keys());
        currentPlayer = playerIds[Math.floor(Math.random() * playerIds.length)];
    }
    else {
        broadcast("Other player's turn", otherPlayer().id);
        broadcast("Ready", currentPlayer);
    }
};

let otherPlayer = () => {
    for (const [id, client] of players.entries()) {
        if (id != currentPlayer) return client
    }
    return null;
};

setInterval(gameLoop, 1000);
