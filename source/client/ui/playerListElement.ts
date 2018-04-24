import { UIElement, view } from "./UIElement";
import { Player, PlayerEventListener } from "../player";
import { PlayerPlateElement } from "./playerPlateElement";
import { ServerConnection } from "../serverConnection";
import { server } from "../../../node_modules/@types/websocket/index";
import { MessageID } from "../../shared/messageID";

@view("playerList")
export class PlayerListElement extends UIElement implements PlayerEventListener{

    private playerPlates = new Map<string, PlayerPlateElement>()

    protected onViewCreated() {
        Player.addEventListener(this)
    }

    private populate(players: Array<Player>) {
        let fragment = document.createDocumentFragment()
        players.forEach( player => {
            var playerPlate = new PlayerPlateElement()
            playerPlate.setPlayer(player)
            playerPlate.appendTo(fragment)
            this.playerPlates.set(player.id, playerPlate)
        })
        this.root.appendChild(fragment)
    }

    private addPlayerPlate(player: Player) {
        var playerPlate = new PlayerPlateElement()
        playerPlate.setPlayer(player)
        playerPlate.appendTo(this.root)
        this.playerPlates.set(player.id, playerPlate)
    }

    private removePlayerPlate(player: Player) {
        let playerPlate = this.playerPlates.get(player.id)
        if (playerPlate) playerPlate.destroy()
        this.playerPlates.delete(player.id)
    }

    onPlayerCameOnline(player: Player) {
        this.addPlayerPlate(player)
    }

    onPlayerWentOffline(player: Player) {
        this.removePlayerPlate(player)
    }

    onAllPlayers(players: Player[]) {
        this.populate(players)
    }
}