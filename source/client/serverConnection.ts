import { MessageID } from "../shared/messageID"
import { API } from "./api";

export class ServerConnection {

    public connected = false
    private websocket: WebSocket = null
    private name: String = null
    private id: String = null
    private events = new Map()
    private requests = new Map()

    connect(name: String) {
        this.websocket = new WebSocket(`ws://${window.location.host}/`)
        this.websocket.onmessage = message => this.handleMessage(message)
        this.websocket.onopen = () => this.handleConnectionOpen()
        this.name = name
    }

    handleConnectionOpen() {
        this.connected = true
        this.send(MessageID.AUTHENTICATE, {jwt: API.jwt})
    }

    handleMessage(message: any) {
        var data = JSON.parse(message.data)
        
        switch (data.id) {
            case MessageID.AUTHENTICATION_SUCCEEDED:
                this.id = data.payload.id
                console.log(`Name set to ${this.name} and id set to ${this.id}.`)
                break
            case MessageID.AUTHENTICATION_FAILED:
                console.warn(`Authentication over websockets failed.`)
                this.websocket.close()
                this.connected = false
                break
            case MessageID.FORWARD:
                this.handleForwardedMessage(data.payload)
                break
            case MessageID.RESPONSE:
                this.handleResponse(data.payload)
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

    private handleResponse(response: any) {
        let request = this.requests.get(response.id)
        if (request) {
            this.requests.delete(response.id)
            request.resolve(response.payload)
        }
    }

    async request(name: MessageID, payload?: any) {
        return new Promise((resolve, reject) => {
            let id = uuid()
            this.send(MessageID.REQUEST, {
                name,
                id,
                payload: JSON.stringify(payload)
            })

            this.requests.set(id, {resolve, reject})
        })
    }

    on(messageId: MessageID, callback: Function) {
        this.events.set(messageId, callback)
    }
    
    remove(messageId: MessageID) {
        this.events.delete(messageId)
    }

    send(messageId: MessageID, payload?: any) {
        if (this.connected)
            this.websocket.send(JSON.stringify({id: messageId, payload}))
        else
            throw new Error("Not connected to anything you dimwit.")
    }

    sendTo(messageId: MessageID, clientId: string, payload?: any) {
        this.send(MessageID.FORWARD, {
            message: {
                id: messageId,
                target: clientId,
                payload
            }
        })
    }
}

function uuid() {
    let arr = new Uint8Array(4)
    crypto.getRandomValues(arr)
    let id = (arr as any as string[]).reduce((sum, byte) => sum + (byte as any).toString(16))
    console.log(id)
    return id
}