export class Connection {
    constructor() {
        this.connected = false
        this.websocket = null
        this.name = null
        this.id = null

        this.events = new Map()
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
                this.send("get players")
                break
            case "name denied":
                console.warn(`${this.name} denied as name.`)
                this.websocket.close()
                this.connected = false
                break
            case "forwarded":
                this.handleForwardedMessage(data.payload)
                break
        }

        this.handleDefaultMessage(data)
    }

    handleDefaultMessage(message) {
        var callback = this.events.get(message.id)
        if (callback)
            callback(message.payload)
    }

    handleForwardedMessage(payload) {
        var callback = this.events.get(payload.message.id)
        if (callback)
            callback(payload.message.payload, payload.from)
    }

    on(messageId, callback) {
        this.events.set(messageId, callback)
    }

    send(messageId, payload) {
        if (this.connected)
            this.websocket.send(JSON.stringify({id: messageId, payload}))
        else
            throw new Error("Not connected to anything you dimwit.")
    }

    sendTo(clientId, messageId, payload) {
        this.send("forward", {
            message: {
                id: messageId,
                target: clientId,
                payload
            }
        })
    }
}