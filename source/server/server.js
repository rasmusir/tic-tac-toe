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

webSocketServer.on("connection", client => {
    console.log("Someone connected :D")

    client.on("message", message => {
        console.log("Someone said: " + message)
    })

    client.on("close", () => {
        console.log("Someone left :(")
    })
})

server.listen(9080, () => console.log("Listening on port 9080"))