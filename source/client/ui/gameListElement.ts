import { UIElement, view, bind } from "./UIElement";
import { Connections } from "../connections";
import { MessageID } from "../../shared/messageID";

@view("gameList")
export class GameListElement extends UIElement {

    @bind("matchmaking")
    private matchmaking : HTMLDivElement

    @bind("listHolder")
    private listHolder : HTMLDivElement

    @bind("list")
    private list : HTMLUListElement

    private connections: Connections

    constructor(connections: Connections) {
        super()
        this.connections = connections
        this.connections.serverConnection.on(MessageID.MATCHMAKE_SUCCESS, (message: any) => {
            console.log(message)
            if (this.connections.serverConnection.id != message.clientIds[0]) {
                this.connections.connectToPlayer(message.clientIds[0])
            }
        })
    }

    protected onViewCreated() {
        let gameli = document.createElement("li")
        let gamea = document.createElement("a")
        gameli.appendChild(gamea)

        gamea.innerText = "Tic Tac Toeeeee"
        gamea.href = "#gameid=1234"
        gamea.onclick = (event) => this.gameSelected(event, "1234")

        this.list.appendChild(gameli)
    }

    private gameSelected(event: Event, gameId: string) {
        event.preventDefault()
        this.connections.serverConnection.send(MessageID.MATCHMAKE, { gameId: gameId })
        this.matchmaking.style.display = "block"
        this.listHolder.style.display = "none"
    }
}