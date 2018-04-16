import * as WebSocket from "ws"
import * as uuid4 from "uuid/v4"

export class Client {

    private name: string = null
    private id: string = null
    private socket: WebSocket = null
    private connectedClients: Map<string, Client>

    constructor(socket: WebSocket, connectedClients: Map<string, Client>) {
        this.socket = socket
        this.connectedClients = connectedClients
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
                if ([...this.connectedClients.values()].find((value: Client) => value.name === message.payload.name)) {
                    this.send("name denied")
                    this.socket.close()
                }
                else {
                    this.id = uuid4()
                    this.name = message.payload.name
                    this.send("name accepted", {
                        id: this.id
                    })
                    this.handleNameAccepted()
                }
                break
            case "get players":
                this.send("players online", {players: [...this.connectedClients.values()].map(client => ({name: client.name, id: client.id}))} )
                break
            case "forward":
                this.handleForward(message.payload)
                break
        }
    }

    handleNameAccepted() {
        this.connectedClients.set(this.id, this)
        this.connectedClients.forEach(client => {
            if (client !== this)
                client.send("player came online", {name: this.name, id: this.id})
        })
    }

    handleForward(payload: any) {
        var target = this.connectedClients.get(payload.message.target)
        console.log(`forwarding ${payload.message.id} from ${this.name} to ${target.name}`)
        if (target)
            target.send("forwarded", {from: this.id, message: payload.message})
    }

    handleClose() {
        this.connectedClients.delete(this.id)
    }
}