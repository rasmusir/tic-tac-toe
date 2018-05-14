import { ServerConnection } from "./serverConnection";
import { WebRTC } from "./webrtcClient";
import { MessageID } from "../shared/messageID";
import { Player } from "./player";

export class Connections {

    public serverConnection: ServerConnection
    public rtc: WebRTC
    public connectedToId: string = ""

    constructor() {
        this.serverConnection = new ServerConnection()
        this.rtc = new WebRTC()
        this.serverConnection.on(MessageID.ICE, (payload: any, from: string) => {
            this.rtc.addIceCandidate(payload.ice)
        })
        this.serverConnection.on(MessageID.SDP, (payload: any, from: string) => {
            this.connectedToId = from
            this.rtc.handleSDP(payload.sdp)
        })
        this.rtc.onICECandidate = event => {
            if (event.candidate)
                this.serverConnection.sendTo(MessageID.ICE, this.connectedToId, { ice: event.candidate })
        }
        this.rtc.onSendLocalDescription = description => this.serverConnection.sendTo(MessageID.SDP, this.connectedToId, {sdp: description})
    }

    async connectToPlayer(peerId: string) {
        this.connectedToId = peerId
        this.rtc.call()
    }

    async connectToServer(name: string) {
        return new Promise((resolve, reject) => {

            this.serverConnection.connect(name)

            this.serverConnection.on(MessageID.AUTHENTICATION_SUCCEEDED, () => {
                this.serverConnection.remove(MessageID.AUTHENTICATION_SUCCEEDED)
                this.serverConnection.remove(MessageID.AUTHENTICATION_FAILED)
                resolve()
            })

            this.serverConnection.on(MessageID.AUTHENTICATION_FAILED, () => {
                this.serverConnection.remove(MessageID.AUTHENTICATION_SUCCEEDED)
                this.serverConnection.remove(MessageID.AUTHENTICATION_FAILED)
                reject()
            })
        })
    }

    async requestPlayers() {
        return this.serverConnection.request(MessageID.GET_PLAYERS) as Promise<Array<Player>>
    }
}