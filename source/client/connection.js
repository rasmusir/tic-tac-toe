export class Connection {
    constructor() {
        this.connected = false
        this.websocket = null
        this.name = null
        this.id = null
    }

    connect(name) {
        this.websocket = new WebSocket("ws://localhost:9080/")
        this.websocket.onmessage = message => this.handleMessage(message)
        this.websocket.onopen = () => this.handleConnectionOpen()
        this.name = name
    }

    handleConnectionOpen() {
        this.connected = true
        this.send("set name", {name: this.name})
    }

    handleMessage(message) {
        var data = JSON.parse(message.data)
        
        switch (data.id) {
            case "name accepted":
                this.id = data.payload.id
                console.log(`Name set to ${this.name} and id set to ${this.id}.`)
                break
            case "name denied":
                console.warn(`${this.name} denied as name.`)
                this.websocket.close()
                this.connected = false
                break
            default:
                console.log(data)
                break
        }
    }

    send(messageId, payload) {
        if (this.connected)
            this.websocket.send(JSON.stringify({id: messageId, payload}))
        else
            throw new Error("Not connected to anything you dimwit.")
    }
}