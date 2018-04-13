export class WebRTC {

    private connection: RTCPeerConnection = null
    public onICECandidate: (event: RTCPeerConnectionIceEvent) => void
    public onSendLocalDescription: (event: RTCSessionDescription) => void

    constructor() {
        this.connection = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]})
        this.connection.onicecandidate = event => this.onICECandidate(event)

        var sendChannel = (this.connection as any).createDataChannel("sendChannel");
        sendChannel.onopen = () => {
            var whatToSend = Math.round((Math.random() * 0xFFFF)).toString(16)
            console.log("data send channel open, sending " + whatToSend)
            sendChannel.send(whatToSend)
        }

        (this.connection as any).ondatachannel = (event: any) => {
            var receiveChannel = event.channel
            console.log("data receive channel open!")
            receiveChannel.onmessage = (event: MessageEvent) => console.log("Got message: " + event.data)
        }
    }

    public async call() {
        var description = await this.connection.createOffer()
        await this.handleDescription(description as any)
    }

    public addIceCandidate(ice: object) {
        console.log("Adding ice candidate")
        this.connection.addIceCandidate(new RTCIceCandidate(ice))
    }

    public async handleSDP(sdp: RTCSessionDescription) {
        console.log("Got SDP")
        await this.connection.setRemoteDescription(new RTCSessionDescription(sdp))
        if (sdp.type == "offer") {
            var description = await this.connection.createAnswer()
            this.handleDescription(description as any)
        }
    }

    private async handleDescription(description: RTCSessionDescription) {
        console.log("Handle description")
        await this.connection.setLocalDescription(description)
        this.onSendLocalDescription(this.connection.localDescription)
    }
}