export class Connection {

    public connected = false
    private websocket: WebSocket = null
    private name: String = null
    private id: String = null
    private events = new Map()

    connect(name: String) {
        this.websocket = new WebSocket(`ws://${window.location.host}/`)
        this.websocket.onmessage = message => this.handleMessage(message)
        this.websocket.onopen = () => this.handleConnectionOpen()
        this.name = name
    }

    handleConnectionOpen() {
        this.connected = true
        this.send("set name", {name: this.name})
    }

    handleMessage(message: any) {
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

    private handleDefaultMessage(message: any) {
        var callback = this.events.get(message.id)
        if (callback)
            callback(message.payload)
    }

    private handleForwardedMessage(payload: any) {
        var callback = this.events.get(payload.message.id)
        if (callback)
            callback(payload.message.payload, payload.from)
    }

    on(messageId: string, callback: Function) {
        this.events.set(messageId, callback)
    }

    send(messageId: string, payload?: any) {
        if (this.connected)
            this.websocket.send(JSON.stringify({id: messageId, payload}))
        else
            throw new Error("Not connected to anything you dimwit.")
    }

    sendTo(clientId: string, messageId: string, payload?: any) {
        this.send("forward", {
            message: {
                id: messageId,
                target: clientId,
                payload
            }
        })
    }
}