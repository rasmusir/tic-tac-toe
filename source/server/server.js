//NOTE import libraries/modules
const express = require("express")
const http = require("http")
const WebSocket = require("ws")

//NOTE create server "app"
const app = express()

//NOTE create server
const server = http.createServer(app)

app.use("/script/", express.static("source/client/"))
app.use("/", express.static("public/views/"))

const webSocketServer = new WebSocket.Server({ server })

var currentId = 1
const connectedClients = new Map()

webSocketServer.on("connection", socket => {
    var client = new Client(socket)
})

class Client {
    constructor(socket) {
        this.name = null
        this.id = null
        this.socket = socket
        this.socket.on("message", message => this.handleMessage(message))
        this.socket.on("close", () => this.handleClose())
    }

    send(messageId, payload) {
        this.socket.send(JSON.stringify({id: messageId, payload}))
    }

    handleMessage(message) {
        message = JSON.parse(message)
        switch (message.id) {
            case "set name":
                if (connectedClients.find((key, value) => value.name === message.payload.name)) {
                    this.send("name denied")
                    this.socket.close()
                }
                else {
                    this.id = currentId++
                    this.name = message.payload.name
                    this.send("name accepted", {
                        id: this.id
                    })
                    connectedClients.set(this.id, this)
                }
                break
        }
    }

    handleClose() {
        connectedClients.delete(this.id)
    }
}

Map.prototype.find = function(func) {
    var foundKey = null
    this.forEach((value, key) => {
        if (func(key, value))
            return foundKey = key
    })
    if (foundKey !== null)
        return this.get(foundKey)
    return null
}

server.listen(9080, () => console.log("Listening on port 9080"))