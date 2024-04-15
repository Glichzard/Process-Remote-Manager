const os = require("os")
const wmi = require("node-wmi")
const io = require("socket.io-client")
const { exec } = require("child_process")
const dotenv = require("dotenv")

dotenv.config()

const serverUrl = process.env.SERVER_URL;
const socket = io.connect(serverUrl);

socket.on('connect', async () => {
    console.log('Conectado al servidor Socket.IO');

    const username = os.userInfo().username;
    const hostname = os.hostname();
    // const requestIp = await fetch(serverUrl + "/getIp")
    // const ip = await requestIp.json()
    const ip = "192.168.1.1"

    socket.emit('connectionInfo', { username, hostname, ip });
});

socket.on('getProcesses', (socketId) => {
    wmi.Query({
        class: 'Win32_Process',
        properties: ['ProcessId', 'Name', 'ExecutablePath', 'ParentProcessId', 'Priority'],
    }, (err, result) => {
        if (err) {
            console.error(`Error al consultar WMI: ${err}`);
            return;
        }

        const processes = result.filter(process => process.Name && process.ExecutablePath);

        socket.emit('processes', { socketId, processes });
    });
});

socket.on("killProcessPid", (pid) => {
    exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`);
            return;
        }

        console.log('Comando ejecutado con éxito:', stdout);
    });
})

socket.on("runProcess", (path) => {
    console.log(path)
    exec(`start ${path}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`Error en la salida estándar: ${stderr}`);
            return;
        }

        console.log('Comando ejecutado con éxito:', stdout);
    });
})
