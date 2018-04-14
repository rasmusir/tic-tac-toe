import {Connection} from './connection'
import { WebRTC } from './webrtcClient';

window.addEventListener("load", main)

function main() {
    var serverConnection = new Connection()
    var rtc = new WebRTC()
    var otherId = ""
    rtc.onICECandidate = event => {
        if (event.candidate)
            serverConnection.sendTo("ice", otherId, { ice: event.candidate })
    }
    rtc.onSendLocalDescription = description => serverConnection.sendTo("sdp", otherId, { sdp: description })

    serverConnection.on("ice", (payload: any, from: string) => {
        console.log("Got ICE from " + from)
        rtc.addIceCandidate(payload.ice)
    })

    serverConnection.on("sdp", (payload: any, from: string) => {
        console.log("Got SDP from " + from)
        otherId = from
        rtc.handleSDP(payload.sdp)
    })

    var nameInput: HTMLInputElement = document.querySelector("#name")
    var connectButton = document.querySelector("#connect")
    var connectionForm = document.querySelector("#connectionForm")
    var playersOnlineList = document.querySelector("#playersOnlineList")
    var playersOnlineCount = document.querySelector("#playersOnlineCount")
    var currentPlayersOnline = 0

    fetch("/playersonline")
            .then(response => response.json())
            .then(response => playersOnlineCount.innerHTML = response.players)

    connectionForm.addEventListener("submit", event => {
        event.preventDefault()
        var name = nameInput.value.trim()
        if (name.length !== 0)
            serverConnection.connect(name)
        else
            alert("Just no mate, enter a name.")
    })

    serverConnection.on("player came online", (player: any) => {
        addPlayer(player)
        currentPlayersOnline++
        playersOnlineCount.innerHTML = currentPlayersOnline.toString()
    })

    serverConnection.on("players online", (payload: any) => {
        playersOnlineList.innerHTML = ""
        currentPlayersOnline = payload.players.length
        playersOnlineCount.innerHTML = currentPlayersOnline.toString()
        payload.players.forEach((player: any) => addPlayer(player))
    })

    function addPlayer(player: any) {
        var button = document.createElement("button")
        button.className = "panel yellow"
        button.innerText = player.name
        button.onclick = () => {
            otherId = player.id
            rtc.call()
        }
        playersOnlineList.appendChild(button)
    }
}