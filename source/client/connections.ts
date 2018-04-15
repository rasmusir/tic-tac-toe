import { ServerConnection } from "./serverConnection";
import { WebRTC } from "./webrtcClient";

export class Connections {

    private serverConnection: ServerConnection
    private rtc: WebRTC
    private connectedToId: string = ""

    constructor() {
        this.serverConnection = new ServerConnection()
        this.rtc = new WebRTC()
        this.serverConnection.on("ice", (payload: any, from: string) => {
            this.rtc.addIceCandidate(payload.ice)
        })
        this.serverConnection.on("sdp", (payload: any, from: string) => {
            this.connectedToId = from
            this.rtc.handleSDP(payload.sdp)
        })
        this.rtc.onICECandidate = event => {
            if (event.candidate)
                this.serverConnection.sendTo("ice", this.connectedToId, { ice: event.candidate })
        }
        this.rtc.onSendLocalDescription = description => this.serverConnection.sendTo("sdp", this.connectedToId, {sdp: description})

    }

    async connectToServer(name: string) {
        return new Promise((resolve, reject) => {

            this.serverConnection.connect(name)

            this.serverConnection.on("name accepted", () => {
                this.serverConnection.remove("name accepted")
                this.serverConnection.remove("name denied")
                resolve()
            })

            this.serverConnection.on("name denied", () => {
                this.serverConnection.remove("name accepted")
                this.serverConnection.remove("name denied")
                reject()
            })
        })
    }
}