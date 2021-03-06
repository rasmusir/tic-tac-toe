import {Connection} from './connection.js'

window.addEventListener("load", main)

function main() {
    var conn = new Connection()
    
    var nameInput = document.querySelector("#name")
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
            conn.connect(name)
        else
            alert("Just no mate, enter a name.")
    })

    conn.on("player came online", player => {
        addPlayer(player)
        currentPlayersOnline++
        playersOnlineCount.innerHTML = currentPlayersOnline
    })

    conn.on("players online", payload => {
        playersOnlineList.innerHTML = ""
        currentPlayersOnline = payload.players.length
        playersOnlineCount.innerHTML = currentPlayersOnline
        payload.players.forEach(player => addPlayer(player))
    })

    conn.on("wave", (payload, from) => {
        alert(from + " waved at you")
    })

    function addPlayer(player) {
        var listItem = document.createElement("li")
        var wave = document.createElement("button")
        wave.innerText = "👋"
        wave.onclick = () => conn.sendTo(player.id, "wave", {text: "no u"})
        listItem.innerHTML = player.name
        listItem.appendChild(wave)
        playersOnlineList.appendChild(listItem)
    }
}