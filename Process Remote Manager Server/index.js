const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/getIp", (req, res) => {
    const { ip } = req;
    res.json(ip);
});

let clientesConectados = [];

io.on("connection", (socket) => {
    io.emit("clientesConectados", clientesConectados);

    socket.on("connectionInfo", (client) => {
        clientesConectados.push({
            socketId: socket.id,
            username: client.username,
            hostname: client.hostname,
            ip: client.ip.split(":")[3],
        });
        io.emit("clientesConectados", clientesConectados);
    });

    socket.on("callClient", (socketId) => {
        io.to(socketId).emit("getProcesses", socketId)
    })

    socket.on("processes", (data) => {
        io.emit("returnedProcceses", { socketId: data.socketId, processes: data.processes })
    })

    socket.on("killProcess", (info) => {
        io.to(info.socketId).emit("killProcessPid", info.pid)
        io.to(info.socketId).emit("getProcesses", info.socketId)
    })

    socket.on("runProcess", (info) => {
        console.log(info.path)
        // io.to(info.socketId).emit("runProcess", info.path)
    })

    socket.on("disconnect", () => {
        clientesConectados = clientesConectados.filter(
            (cliente) => cliente.socketId !== socket.id
        );

        io.emit("clientesConectados", clientesConectados);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
