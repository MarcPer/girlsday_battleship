const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:8000");

ioClient.on("msg", (msg) => console.info(msg));
setInterval(() => {
    ioClient.emit("input", "Ahoy!");
}, 1000);
