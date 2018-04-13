//NOTE import libraries/modules
import * as express from "express"
import * as http from "http"
import * as WebSocket from "ws"
//NOTE create server "app"
const app = express()

//NOTE create server
const server = http.createServer(app)
const webSocketServer = new WebSocket.Server({ server })

var currentId = 1
const connectedClients = new Map<String, Client>()

app.use("/script/", express.static("build/client/", {extensions: ["js"]}))
app.use("/", express.static("public/views/"))

app.get("/playersonline", (req, res) => res.send(JSON.stringify({players: connectedClients.size})))

webSocketServer.on("connection", socket => {
    var client = new Client(socket)
})

class Client {

    private name: String = null
    private id: String = null
    private socket: WebSocket = null

    constructor(socket: WebSocket) {
        this.socket = socket
        this.socket.on("message", message => this.handleMessage(message))
        this.socket.on("close", () => this.handleClose())
    }

    send(messageId: String, payload?: any) {
        this.socket.send(JSON.stringify({id: messageId, payload}))
    }

    handleMessage(message: any) {
        message = JSON.parse(message)
        switch (message.id) {
            case "set name":
                if ([...connectedClients.values()].find((value: Client) => value.name === message.payload.name)) {
                    this.send("name denied")
                    this.socket.close()
                }
                else {
                    this.id = (currentId++).toString()
                    this.name = message.payload.name
                    this.send("name accepted", {
                        id: this.id
                    })
                    this.handleNameAccepted()
                }
                break
            case "get players":
                this.send("players online", {players: [...connectedClients.values()].map(client => ({name: client.name, id: client.id}))} )
                break
            case "forward":
                this.handleForward(message.payload)
                break
        }
    }

    handleNameAccepted() {
        connectedClients.set(this.id, this)
        connectedClients.forEach(client => {
            if (client !== this)
                client.send("player came online", {name: this.name, id: this.id})
        })
    }

    handleForward(payload: any) {
        var target = connectedClients.get(payload.message.target)
        console.log(`forwarding ${payload.message.id} from ${this.name} to ${target.name}`)
        if (target)
            target.send("forwarded", {from: this.id, message: payload.message})
    }

    handleClose() {
        connectedClients.delete(this.id)
    }
}

server.listen(9080, () => console.log("Listening on port 9080"))