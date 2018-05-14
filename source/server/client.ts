import * as WebSocket from "ws"
import * as uuid4 from "uuid/v4"
import { User } from "./model/user";
import * as jsonwebtoken from "jsonwebtoken";
import { ServerOptions } from "./serverOptions";
import { MessageID } from "../shared/messageID";
import { Matchmaker } from "./matchmaker";
import { listeners } from "cluster";

export class Client {
    public user: User
    public id: string = null
    private socket: WebSocket = null
    private connectedClients: Map<string, Client>
    private matchmaker: Matchmaker

    private onceListeners = new Map<string, Array<Function>>()
    private requestListeners = new Map()

    constructor(socket: WebSocket, connectedClients: Map<string, Client>, matchmaker: Matchmaker) {
        this.socket = socket
        this.matchmaker = matchmaker
        this.connectedClients = connectedClients
        this.id = uuid4()
        this.socket.on("message", message => this.handleMessage(message))
        this.socket.on("close", () => this.handleClose())
        this.onRequest(MessageID.GET_PLAYERS, () => [...this.connectedClients.values()])
    }

    handleMessage(message: any) {
        message = JSON.parse(message)
        switch (message.id) {
            case MessageID.AUTHENTICATE:
                this.handleAuthentication(message.payload)
                break
            case MessageID.FORWARD:
                this.handleForward(message.payload)
                break
            case MessageID.REQUEST:
                this.handleRequest(message.payload)
                break
            case MessageID.CHAT_MESSAGE:
                this.handleChatMessage(message.payload)
                break
            case MessageID.MATCHMAKE:
                this.matchmaker.handleMatchmake(this, message.payload)
                break
        }
    }

    async handleAuthentication(data: any) {
        jsonwebtoken.verify(data.jwt, ServerOptions.jwtKey, (err: any, decoded: any) => {
            if (err) {
                this.send(MessageID.AUTHENTICATION_FAILED)
                this.socket.close()
                return
            } else {
                this.user = decoded.user
                this.connectedClients.set(this.id, this)
                this.send(MessageID.AUTHENTICATION_SUCCEEDED, {id: this.id})
                this.broadcast(MessageID.PLAYER_CAME_ONLINE, this)
            }
        })
    }
    
    handleChatMessage(data: any) {
        this.broadcast(MessageID.CHAT_MESSAGE, { id: this.id, text: data.text }, true)
    }

    handleRequest(request: any) {
        let requestListener = this.requestListeners.get(request.name)
        if (requestListener) {
            let responseData = requestListener(request.payload)
            let response = {
                id: request.id,
                payload: responseData
            }
            this.send(MessageID.RESPONSE, response)
        }
    }

    handleForward(payload: any) {
        var target = this.connectedClients.get(payload.message.target)
        console.log(`forwarding ${payload.message.id} from ${this.user.displayname} to ${target.user.displayname}`)
        if (target)
            target.send(MessageID.FORWARD, {from: this.id, message: payload.message})
    }

    handleClose() {
        this.broadcast(MessageID.PLAYER_WENT_OFFLINE, { id: this.id })
        let listeners = this.onceListeners.get("close")
        this.onceListeners.delete("close")
        listeners.forEach(callback => callback())
        this.connectedClients.delete(this.id)
    }

    send(messageId: MessageID, payload?: any) {
        this.socket.send(JSON.stringify({id: messageId, payload}))
    }

    broadcast(id: MessageID, payload: any, toMe: boolean = false) {
        this.connectedClients.forEach(client => {
            if (toMe || client !== this)
                client.send(id, payload)
        })
    }

    onRequest(messageId: MessageID, callback: (payload?: any) => any) {
        this.requestListeners.set(messageId, callback)
    }

    once(event: string, callback: Function) {
        let listeners = this.onceListeners.get(event)
        if (listeners) {
            listeners.push(callback)
        } else {
            this.onceListeners.set(event, [callback])
        }
        return callback
    }

    removeOnceListener(event: string, callback: Function) {
        let listeners = this.onceListeners.get(event)
        if (listeners) {
            this.onceListeners.set(event, listeners.filter(cb => cb !== callback))
        }
    }

    toJSON() {
        return {
            id: this.id,
            user: {
                displayname: this.user.displayname,
                title: this.user.title
            }
        }
    }
}