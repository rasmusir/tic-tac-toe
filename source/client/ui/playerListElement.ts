import { UIElement, view } from "./UIElement";
import { Player } from "../player";
import { PlayerPlateElement } from "./playerPlateElement";
import { ServerConnection } from "../serverConnection";
import { server } from "../../../node_modules/@types/websocket/index";
import { MessageID } from "../../shared/messageID";

@view("playerList")
export class PlayerListElement extends UIElement{
    protected onViewCreated() {
        
    }

    public async setServerConnection(serverConnection: ServerConnection) {
        let players = await serverConnection.request(MessageID.GET_PLAYERS) as Array<Player>
        this.populate(players)
        serverConnection.on(MessageID.PLAYER_CAME_ONLINE, (player: Player) => this.addPlayer(player))
    }

    private populate(players: Array<Player>) {
        let fragment = document.createDocumentFragment()
        players.forEach( player => {
            var playerPlate = new PlayerPlateElement()
            playerPlate.setPlayer(player)
            playerPlate.appendTo(fragment)
        })
        this.root.appendChild(fragment)
    }

    private addPlayer(player: Player) {
        var playerPlate = new PlayerPlateElement()
        playerPlate.setPlayer(player)
        playerPlate.appendTo(this.root)
    }
}